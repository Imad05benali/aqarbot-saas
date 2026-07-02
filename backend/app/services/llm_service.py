import os
import json
import traceback
import time
import random
from google import genai
from google.genai import types

class LLMService:
    @staticmethod
    def _call_gemini_with_retry(model: str, contents: str, config=None, max_retries: int = 3):
        """
        Internal helper to execute Gemini calls with exponential backoff for 429/503 errors.
        """
        client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
        for attempt in range(max_retries):
            try:
                if config:
                    return client.models.generate_content(model=model, contents=contents, config=config)
                return client.models.generate_content(model=model, contents=contents)
            except Exception as e:
                err_msg = str(e).upper()
                is_retryable = "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "503" in err_msg or "OVERLOADED" in err_msg
                
                if is_retryable and attempt < max_retries - 1:
                    wait_time = (2 ** attempt) + random.uniform(0, 1)
                    print(f"\n⚠️  QUOTA HIT (Attempt {attempt+1}). Retrying in {wait_time:.2f}s...")
                    time.sleep(wait_time)
                    continue
                raise e

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
            # SYNC: Using gemini-2.0-flash-lite for higher availability
            response = LLMService._call_gemini_with_retry(
                model='gemini-2.0-flash-lite',
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
                model='gemini-2.0-flash-lite',
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
        
        for c in cities:
            if c in message_text_lower:
                local_intent["City"] = c.capitalize()
                break
        for k, v in types_map.items():
            if k in message_text_lower:
                local_intent["Type"] = v
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
                model='gemini-2.0-flash-lite',
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
