import os
import json
import traceback
import time
import random
import re
import logging
import urllib.request
from datetime import datetime, timedelta, timezone
from google import genai
from google.genai import types
from app.core.supabase import supabase

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# --- GEMINI MODEL CHAIN ---------------------------------------------------
# Every Gemini call walks an ordered model chain: the preferred model first,
# then the models the API actually reports as available, then the static
# fallbacks below. Override entirely with GEMINI_MODEL_CHAIN (comma-separated).
DEFAULT_MODEL = "gemini-3.5-flash-lite"
FALLBACK_MODELS = ["gemini-3-flash", "gemini-2.5-flash"]

# 10-minute cache of the models reported by the Gemini API for this key.
_MODEL_CACHE = {"ts": 0.0, "names": []}


def _fetch_available_models() -> list:
    """List the Gemini models actually available to the runtime API key."""
    now = time.time()
    if _MODEL_CACHE["names"] and now - _MODEL_CACHE["ts"] < 600:
        return _MODEL_CACHE["names"]
    try:
        key = os.getenv("GOOGLE_API_KEY")
        if not key:
            return []
        with urllib.request.urlopen(
            f"https://generativelanguage.googleapis.com/v1beta/models?key={key}",
            timeout=10,
        ) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
        names = []
        for m in payload.get("models", []):
            n = m.get("name", "")
            if n.startswith("models/gemini"):
                names.append(n.split("/", 1)[1])
        # flash-lite first, then other flash, then pro models
        names.sort(key=lambda n: (0 if "flash-lite" in n else 1 if "flash" in n else 2, n))
        _MODEL_CACHE["ts"] = now
        _MODEL_CACHE["names"] = names
        print(f"\n[Gemini] models available ({len(names)}): {names[:10]}")
        return names
    except Exception as e:
        print(f"[Gemini] model discovery failed (using static fallbacks): {e}")
        return []


def _model_chain(preferred: str) -> list:
    env_chain = os.getenv("GEMINI_MODEL_CHAIN")
    if env_chain and env_chain.strip():
        return [m.strip() for m in env_chain.split(",") if m.strip()]
    chain = [preferred]
    for name in _fetch_available_models()[:8]:
        if name not in chain:
            chain.append(name)
    for name in FALLBACK_MODELS:
        if name not in chain:
            chain.append(name)
    return chain

AQARBOT_SYSTEM_PROMPT = """
You are AqarBot, a professional Moroccan virtual real estate agent. You must converse with the user exclusively in Moroccan Darija, maintaining a respectful, friendly, and highly concise tone suitable for WhatsApp. 
Your primary goal is to guide the client step-by-step to find the perfect match from the `morocco_properties` database and successfully book a viewing appointment.

You must strictly adhere to the following State Machine flow:

Stage 1: GREETING, CLIENT NAME & OPERATION TYPE
- Greet the client warmly in Moroccan Darija.
- If the CURRENT CLIENT CONTEXT says the client's full name is NOT yet known, your very first message must politely ask for their full name (ONE question) and nothing else.
- Once the client tells you their name (or it is already known), thank them by name and ask ONE direct question to determine their intent: "مرحبا بك! واش كتقلب على عقار للبيع ولا للكراء؟" (Are you looking to buy or rent?).
- If you already asked for the name earlier in this conversation, never ask again — continue politely with the property flow (the backend captures the name from what the client says).
- Do not ask for any other criteria until the operation type is established.

Stage 2: QUALIFICATION (Sequential Gathering)
- Once the operation type is set, ask for the following criteria one by one (Never ask multiple questions in a single message):
  1. Preferred city or neighborhood.
  2. Property type (apartment, villa, land, etc.).
  3. Maximum budget.
- Interact naturally to encourage the client to provide these details.

Stage 3: INTENT EXTRACTION (Database Query)
- As soon as the client has provided the core criteria (operation, city, type, budget), STOP the natural conversation.
- Output ONLY a strict JSON object to trigger a search in the `morocco_properties` database table. Do not include any conversational text outside the JSON.
Required Format:
{
  "status": "ready_to_search",
  "target_table": "morocco_properties",
  "operation": "vente" | "location",
  "property_type": "...",
  "city": "...",
  "max_budget": 0
}

Stage 4: PRESENTATION 
- When the system backend feeds you the results retrieved from the `morocco_properties` table (including the `image_url`), present the properties to the client in a brief, attractive manner (mentioning only the price and one main feature).
- Prompt the client to choose: "أشمن واحد فهادو عجبك باش نصيفط ليك تصويرتو والتفاصيل ديالو؟"

Stage 5: SEND IMAGE & CLOSING
- When the client selects a specific property to view, output ONLY a JSON object so the system can utilize the WhatsApp Media API to send the image directly.
Required Format:
{
  "status": "send_image",
  "image_url": "the_specific_image_url_provided_in_the_database_results",
  "caption": "A short, attractive description of the property in Darija including the price + a direct Call to Action (e.g., 'واش تبغي نقيد ليك موعد باش تشوف هاد العقار غدا؟')"
}
"""

class LLMService:
    @staticmethod
    def _call_gemini_with_retry(model: str, contents: str, config=None, max_retries: int = 3):
        """
        Internal helper to execute Gemini calls with exponential backoff for
        429/5xx errors, falling back across the model chain when the primary
        model is overloaded (e.g. HTTP 503 high demand).
        """
        client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
        chain = _model_chain(model)
        last_error: Exception | None = None
        # Small total budget: an overloaded model is usually still overloaded a
        # second later, so we retry briefly and move DOWN the chain fast instead
        # of burning ~7s of exponential backoff on the primary model alone.
        max_total_attempts = 6
        total_attempts = 0

        for idx, m in enumerate(chain):
            if total_attempts >= max_total_attempts:
                break
            # One quick retry on the first two models, one shot on the rest.
            attempts = min(2 if idx <= 1 else 1, max_total_attempts - total_attempts)
            for attempt in range(attempts):
                total_attempts += 1
                try:
                    if config:
                        return client.models.generate_content(model=m, contents=contents, config=config)
                    return client.models.generate_content(model=m, contents=contents)
                except Exception as e:
                    err_msg = str(e).upper()
                    is_retryable = any(
                        t in err_msg for t in ("429", "RESOURCE_EXHAUSTED", "503", "OVERLOADED", "UNAVAILABLE", "500", "INTERNAL")
                    )
                    last_error = e
                    # Short, capped retry only for transient overload errors.
                    if is_retryable and attempt < attempts - 1 and total_attempts < max_total_attempts:
                        wait_time = 0.8 + random.uniform(0, 0.7)
                        print(f"\n[Gemini] QUOTA HIT on {m} (Attempt {attempt + 1}). Retrying in {wait_time:.2f}s...")
                        time.sleep(wait_time)
                        continue
                    if m != chain[-1] and total_attempts < max_total_attempts:
                        print(f"\n[Gemini] MODEL {m} FAILED ({type(e).__name__}). Next -> {chain[idx + 1]}")
                        break
                    raise last_error

        raise last_error if last_error else RuntimeError("Gemini call failed: empty model chain")

    @staticmethod
    def chat_with_agent(phone_number: str, user_message: str, agency_id: str = None,
                        client_full_name: str = None, ask_for_name: bool = False) -> str:
        """
        Manages the conversational state with the LLM via Supabase conversation_history.
        client_full_name / ask_for_name are the backend's live lead data: they tell
        the bot whether to politely request the client's full name at greeting time.
        """
        try:
            # 1. Store user message in DB
            logger.info("Attempting to save user message to Supabase...")
            db_save_user = supabase.table("conversation_history").insert({
                "phone_number": phone_number,
                "role": "user",
                "content": user_message
            }).execute()

            # 2. Fetch history (Last 24 hours)
            logger.info("Attempting to fetch conversation history from Supabase...")
            time_threshold = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
            history_req = supabase.table("conversation_history").select("*").eq("phone_number", phone_number).gte("created_at", time_threshold).order("created_at", desc=False).execute()
            history_records = history_req.data if history_req.data else []
            logger.info(f"Successfully fetched {len(history_records)} history records.")

            # 3. Format history for Gemini API
            contents = []
            for record in history_records:
                role = record["role"]
                # Convert 'model' back to 'model' for Gemini
                contents.append(types.Content(role=role, parts=[types.Part.from_text(text=record["content"])]))
            
            # 4. Call Gemini
            logger.info("Sending prompt and history to Gemini...")
            known_name = bool((client_full_name or "").strip()) and not ask_for_name
            dynamic_context = (
                "\n\nCURRENT CLIENT CONTEXT (authoritative, provided by the backend):\n"
                f"- Full name: {str(client_full_name).strip() if known_name else 'NOT YET PROVIDED'}\n"
                f"- Client name required: {'yes' if ask_for_name and not known_name else 'no'}\n"
            )
            config = types.GenerateContentConfig(
                system_instruction=AQARBOT_SYSTEM_PROMPT + dynamic_context,
                temperature=0.7
            )
            response = LLMService._call_gemini_with_retry(
                model='gemini-3.5-flash-lite',
                contents=contents,
                config=config
            )
            
            model_text = response.text.strip()
            logger.info("Successfully received Gemini response.")
            
            # 5. Save model response to DB
            logger.info("Attempting to save model response to Supabase...")
            db_save_model = supabase.table("conversation_history").insert({
                "phone_number": phone_number,
                "role": "model",
                "content": model_text
            }).execute()

            return model_text
            
        except Exception as e:
            logger.error(f"CRITICAL ERROR in chat_with_agent: {str(e)}", exc_info=True)
            # Make sure we don't return silent strings during testing if they want explicit logs.
            # Returning fallback, but logs will contain the raw trace.
            return "Sma7 lia khoya, kayn mouchkil tekniki 7alyan. Jereb mrra okhra men be3d! 🏠"

    # ───────────────────────────────────────────────────────────
    #  QUALIFICATION STATE: Step-by-step question prompts
    # ───────────────────────────────────────────────────────────

    @staticmethod
    def generate_qualification_reply(
        state: str,
        client_message: str,
        agency_name: str = "AqarBot",
        collected: dict = None
    ) -> str:
        """
        Generates a context-aware Darija response for each step of the
        structured real-estate qualification protocol.

        States: AWAITING_NAME -> AWAITING_TYPE -> AWAITING_CITY
                -> AWAITING_SECTOR -> AWAITING_BUDGET -> QUALIFIED
        """
        collected = collected or {}

        state_prompts = {
            "GREETING": (
                f"You are AqarBot AI, the smart real estate assistant for the agency '{agency_name}'.\n"
                "A new client just contacted you for the first time on WhatsApp.\n"
                "Greet them warmly in Moroccan Darija (Latin characters), introduce yourself as the AI assistant "
                f"for '{agency_name}', and ask for their full name.\n"
                "Use emojis. Keep it short and professional. Max 2-3 lines.\n"
                "Do NOT ask about properties yet — only ask for the name."
            ),
            "AWAITING_NAME": (
                f"You are AqarBot AI for the agency '{agency_name}'.\n"
                f"The client just told you their name. Their message: \"{client_message}\"\n"
                "Thank them warmly in Moroccan Darija (Latin characters), use their name, and then ask:\n"
                "\"Wach kat-9elleb 3la Appartement wla Villa?\"\n"
                "You MUST ask the Type question. Use emojis. Short and warm. Max 2-3 lines."
            ),
            "AWAITING_TYPE": (
                f"You are AqarBot AI for '{agency_name}'.\n"
                f"The client '{collected.get('name', '')}' just told you the property type.\n"
                f"Their message: \"{client_message}\"\n"
                "Acknowledge their choice warmly in Darija and ask:\n"
                "\"F ina medina kat-9elleb? (Casa, Rabat, Marrakech, Tanger...)\"\n"
                "You MUST ask for the City. Use emojis. Max 2-3 lines."
            ),
            "AWAITING_CITY": (
                f"You are AqarBot AI for '{agency_name}'.\n"
                f"The client '{collected.get('name', '')}' wants a {collected.get('Type', 'property')} "
                f"and just told you the city.\n"
                f"Their message: \"{client_message}\"\n"
                "Acknowledge the city warmly in Darija and ask:\n"
                "\"F ina 7ay / secteur / lblasa exactement kat-9elleb? (Maarif, Agdal, Guéliz...)\"\n"
                "You MUST ask for the Sector/Neighborhood. Use emojis. Max 2-3 lines."
            ),
            "AWAITING_SECTOR": (
                f"You are AqarBot AI for '{agency_name}'.\n"
                f"The client '{collected.get('name', '')}' wants a {collected.get('Type', 'property')} "
                f"in {collected.get('City', 'the city')}, sector {client_message}.\n"
                f"Their message: \"{client_message}\"\n"
                "Acknowledge their sector choice warmly in Darija and ask:\n"
                "\"Chhal howa l-budget dyalk? (par exemple: 500,000 DH, 1 million DH...)\"\n"
                "You MUST ask for the Budget. Use emojis. Max 2-3 lines."
            ),
            "AWAITING_BUDGET": (
                f"You are AqarBot AI for '{agency_name}'.\n"
                f"The client gave you their budget. Message: \"{client_message}\"\n"
                "Do NOT generate any confirmation yourself.\n"
                "Just say a very short warm acknowledgment in Darija like: \"Wakha, mzyan bzaf! ☺️\"\n"
                "Keep it to ONE short line. The backend will append the structured confirmation."
            ),
        }

        prompt = state_prompts.get(state)
        if not prompt:
            prompt = (
                f"You are AqarBot AI for '{agency_name}'. Respond helpfully in Darija to: \"{client_message}\"\n"
                "Use emojis. Max 2-3 lines."
            )

        try:
            response = LLMService._call_gemini_with_retry(
                model='gemini-3.5-flash-lite',
                contents=prompt
            )
            return response.text.strip()
        except Exception:
            print(f"\n🚀 AI SURVIVAL MODE: {traceback.format_exc()}")
            # Static fallbacks per state
            fallbacks = {
                "GREETING": f"Mar7ba bik m3a {agency_name}! 🏠 3afak, chnou s-smiya l-karima dyalk?",
                "AWAITING_NAME": f"Metcharfin a si {client_message}! 🙌 Wach kat-9elleb 3la Appartement wla Villa?",
                "AWAITING_TYPE": f"Wakha mzyan! 👍 F ina medina kat-9elleb? (Casa, Rabat, Marrakech...)",
                "AWAITING_CITY": f"Mzyan {client_message}! 🏙️ F ina 7ay / secteur / lblasa exactement?",
                "AWAITING_SECTOR": f"Top, {client_message}! 📍 Chhal howa l-budget dyalk? (500K, 1M DH...)",
                "AWAITING_BUDGET": "Wakha, mzyan bzaf! ☺️",
            }
            return fallbacks.get(state, f"Sma7 lia, kayn mouchkil tekniki. Ghadi n-3awedou! 🏠")

    # ───────────────────────────────────────────────────────────
    #  FINAL CONFIRMATION: Structured lead qualification output
    # ───────────────────────────────────────────────────────────

    @staticmethod
    def generate_confirmation_message(
        agency_name: str,
        prop_type: str,
        city: str,
        sector: str,
        budget: str
    ) -> str:
        """
        Produces the exact structured confirmation layout required by the
        qualification protocol. This is deterministic — no LLM involved.
        """
        sector_display = sector if sector and sector != "Non spécifié" else "Non spécifié"
        budget_display = budget if budget else "Non spécifié"

        return (
            f"Parfait ! Votre demande a été enregistrée avec succès pour l'agence {agency_name}.\n"
            f"Détails : {prop_type} à {city} (Secteur : {sector_display}) | Budget : {budget_display}.\n"
            f"Un de nos agents commerciaux va vous contacter dans les plus brefs délais. "
            f"Merci pour votre confiance ! 🙏🏠"
        )

    # ───────────────────────────────────────────────────────────
    #  LEGACY: Property-based reply (still used for search results)
    # ───────────────────────────────────────────────────────────

    @staticmethod
    def _static_property_formatter(properties_data: list, needs_lead: bool, is_fallback: bool = False) -> str:
        """
        AI SURVIVAL MODE: Formats results without using the LLM.
        """
        if not properties_data:
            return "Sma7 lia, mal9itch chi 7aja b-had l-mowasafat 7alyan. Ghadi n-9elleb lik ktar! 🔍"
        
        if needs_lead:
            return "L9it lik chi 7wayj mofidin bzaf! 😍 Ghir 3tini ssmîtya dyalk nrejixtrik m3ana bach nṣîft lik telfon dyal l-agence direct."

        prefix = "Sma7 lia, mal9itch l-exact dyal chnou tlabti, walakin ha chnou l9it lik li mzyan 7alyan: 🏠\n\n" if is_fallback else "L9it lik had l-3orod l-khayyalin: 🏠\n\n"
        
        response = prefix
        for p in properties_data[:3]:
            agency = p.get("agency", {})
            response += f"📍 {p.get('title')}\n"
            response += f"💰 {p.get('new_price')} DH | {p.get('City')}\n"
            response += f"📞 Agence: {agency.get('phone', 'N/A')}\n"
            response += "------------------\n"
        
        response += "\nKhdit had l-3orod direct mn l-base de données dyalna. InchaAllah i3jbok!"
        return response

    @staticmethod
    def generate_whatsapp_reply(client_message: str, properties_data: list, needs_lead_collection: bool = False, is_fallback: bool = False) -> str:
        """
        Generates a personalized response in Moroccan Darija.
        Falls back to AI Survival Mode if the Gemini API is exhausted.
        """
        # 1. Build Property Context for LLM
        context_properties = ""
        if properties_data:
            for prop in properties_data:
                agency = prop.get("agency", {})
                context_properties += f"""
                - ID: {prop.get('id', 'N/A')}
                - Title: {prop.get('title')}
                - Price: {prop.get('new_price')} DH
                - Sector: {prop.get('Nighberd')}
                - City: {prop.get('City')}
                - Type: {prop.get('Type')}
                - Agency: {agency.get('name', 'N/A')}
                - Contact: {agency.get('phone', 'N/A')}
                """
        else:
            context_properties = "No matching properties."

        # 2. Define Behavioral Instructions
        fallback_instruction = "IMPORTANT: This is a fallback result. Explain politely in Darija that you didn't find the exact match but found these great alternatives in the same city." if is_fallback else ""
        
        if needs_lead_collection and properties_data:
            behavior_instruction = "Matches found. Ask for the user's name warmly in Darija."
        elif properties_data:
            behavior_instruction = f"Provide property details and contact info in Darija. {fallback_instruction}"
        else:
            behavior_instruction = "No matches found. Explain politely in Darija."

        system_prompt = f"""
        Role: 'AqarBot AI', a Moroccan real estate assistant.
        Language: Moroccan Darija (Latin characters). Use emojis.
        {behavior_instruction}
        Context:
        - Message: "{client_message}"
        - Data: {context_properties}
        """

        try:
            # SYNC: Using gemini-3.5-flash-lite for higher availability
            response = LLMService._call_gemini_with_retry(
                model='gemini-3.5-flash-lite',
                contents=system_prompt
            )
            return response.text.strip()
        except Exception:
            # --- AI SURVIVAL MODE ACTIVATION ---
            print(f"\n🚀 AI SURVIVAL MODE ACTIVATED: {traceback.format_exc()}")
            return LLMService._static_property_formatter(properties_data, needs_lead_collection, is_fallback)

    @staticmethod
    def extract_client_name(message_text: str) -> str:
        """
        Optimized name extraction: Bypasses LLM for simple one-word answers.
        """
        text_clean = message_text.strip()
        words = text_clean.split()
        
        if len(words) == 1:
            name = words[0].capitalize()
            print(f"DEBUG: Fast-path name extraction (No LLM): {name}")
            return name

        prompt = f"""Extract the personal name from: "{message_text}"\nReturn ONLY the name. If none, return "Unknown"."""
        
        try:
            config = types.GenerateContentConfig(temperature=0.0)
            response = LLMService._call_gemini_with_retry(
                model='gemini-3.5-flash-lite',
                contents=prompt,
                config=config
            )
            name = response.text.strip()
            return name if name.lower() != "unknown" else None
        except Exception:
            print(f"ERROR: Extraction failed: {traceback.format_exc()}")
            return words[0].capitalize() if words else None

    @staticmethod
    def parse_property_intent(message_text: str) -> dict:
        """
        Extracts structured search entities (City, Nighberd, Type) from Darija.
        Includes a local keyword fallback for stability when the LLM is unavailable.
        """
        message_text_lower = message_text.lower()
        
        # 1. Local Keyword Scanning (Resiliency Layer)
        local_intent = {"City": None, "Type": None, "Nighberd": None}
        
        cities = ["casablanca", "rabat", "marrakech", "tangier", "tanger", "fes", "meknes", "agadir", "oujda", "kenitra", "tetouan", "safi", "mohammadia"]
        types_map = {
            "appartement": "Appartement", "ch9a": "Appartement", "appart": "Appartement",
            "villa": "Villa",
            "riad": "Riad",
            "magasin": "Magasin", "mahal": "Magasin",
            "terrain": "Terrain", "ard": "Terrain",
            "bureau": "Bureau",
            "maison": "Maison", "dar": "Maison"
        }
        # Moroccan sector/neighborhood keyword dictionary for local extraction
        sectors_map = {
            # Casablanca
            "hamria": "Hamria", "anfa": "Anfa", "maarif": "Maarif", "ma3arif": "Maarif",
            "ain diab": "Ain Diab", "ain sebaa": "Ain Sebaa", "bernoussi": "Bernoussi",
            "sidi maarouf": "Sidi Maarouf", "bourgogne": "Bourgogne", "gauthier": "Gauthier",
            "hay hassani": "Hay Hassani", "sbata": "Sbata", "derb sultan": "Derb Sultan",
            "oulfa": "Oulfa", "hay mohammadi": "Hay Mohammadi", "2mars": "2 Mars",
            "palmier": "Palmier", "racine": "Racine", "triangle d'or": "Triangle d'Or",
            "belvédère": "Belvédère", "belvedere": "Belvédère", "california": "California",
            # Rabat
            "agdal": "Agdal", "hay riad": "Hay Riad", "ocean": "Océan",
            "souissi": "Souissi", "hassan": "Hassan", "yacoub el mansour": "Yacoub El Mansour",
            "les orangers": "Les Orangers", "temara": "Témara",
            # Marrakech
            "gueliz": "Guéliz", "hivernage": "Hivernage", "targa": "Targa",
            "palmeraie": "Palmeraie", "menara": "Ménara", "sidi ghanem": "Sidi Ghanem",
            "amelkis": "Amelkis", "route de fes": "Route de Fès",
            # Tanger
            "malabata": "Malabata", "iberia": "Iberia", "boukhalef": "Boukhalef",
            "marchane": "Marchane", "moujahidine": "Moujahidine",
            # Fès
            "ville nouvelle": "Ville Nouvelle", "saiss": "Saiss", "narjiss": "Narjiss",
            # Meknès
            "hamria meknes": "Hamria", "marjane": "Marjane",
            # Agadir
            "talborjt": "Talborjt", "hay mohammadi agadir": "Hay Mohammadi",
            "founty": "Founty", "sonaba": "Sonaba",
        }
        
        for c in cities:
            if c in message_text_lower:
                local_intent["City"] = c.capitalize()
                break
        for k, v in types_map.items():
            if k in message_text_lower:
                local_intent["Type"] = v
                break
        # Sector/Neighborhood extraction (scan for known Moroccan sectors)
        for k, v in sectors_map.items():
            if k in message_text_lower:
                local_intent["Nighberd"] = v
                break

        # 2. Try LLM Enrichment
        prompt = f"""
        Extract search entities from: "{message_text}"
        Return JSON: {{"City": "...", "Type": "...", "Nighberd": "..."}}
        Missing: null.
        """
        try:
            config = types.GenerateContentConfig(temperature=0.0, response_mime_type="application/json")
            response = LLMService._call_gemini_with_retry(
                model='gemini-3.5-flash-lite',
                contents=prompt,
                config=config
            )
            llm_intent = json.loads(response.text.strip())
            # Merge: LLM found content takes priority, otherwise use local scan
            return {
                "City": llm_intent.get("City") or local_intent["City"],
                "Type": llm_intent.get("Type") or local_intent["Type"],
                "Nighberd": llm_intent.get("Nighberd") or local_intent["Nighberd"]
            }
        except Exception as e:
            print(f"⚠️ [Intent Parsing Fallback]: Using keywords (API Error: {str(e)})")
            return local_intent

    @staticmethod
    def extract_budget(message_text: str) -> str:
        """
        Extracts a budget figure from free-form Darija text.
        Handles formats like: '500000', '1 million', '1M', '800K', '500,000 DH'.
        """
        import re
        text = message_text.lower().replace(",", "").replace(".", "").replace(" ", "")

        # Check for 'million' shorthand
        m_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:million|m|mly)', message_text.lower().replace(",", ""))
        if m_match:
            val = float(m_match.group(1))
            return f"{int(val * 1_000_000)} DH"

        # Check for 'K' shorthand
        k_match = re.search(r'(\d+)\s*k', message_text.lower().replace(",", ""))
        if k_match:
            val = int(k_match.group(1))
            return f"{val * 1000} DH"

        # Raw number extraction
        num_match = re.search(r'(\d{4,})', text)
        if num_match:
            return f"{int(num_match.group(1))} DH"

        # If nothing numeric found, just return the raw text trimmed
        return message_text.strip()
