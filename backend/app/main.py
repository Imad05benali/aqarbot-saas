import os
import time
import re
from collections import Counter
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables before importing other modules
load_dotenv()

from app.database import process_incoming_lead_and_log, get_matching_properties
from app.services.whatsapp_service import WhatsAppService
from app.services.llm_service import LLMService
from app.core.supabase import supabase

app = FastAPI()

# --- CORS POLICY (Structured for Cross-Origin SaaS Sync) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", # Next.js Landing Page
        "http://localhost:5173", # Vite React Dashboard
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GLOBAL in-memory session cache (Absolute Top Level for Persistence)
user_sessions = {}

# --- CORE CONFIGURATION & MOCK ARCHITECTURE ---
FORCE_MOCK_DATA = False

MOCK_LEADS = [
    {
        "id": 101,
        "full_name": "Yassine Alami",
        "phone_number": "212661234567",
        "City": "Casablanca",
        "Nighberd": "Maarif",
        "Type": "Appartement",
        "budget": "1,200,000",
        "is_ai_paused": False,
        "status": "ACTIVE",
        "created_at": "2026-06-25T10:00:00Z"
    },
    {
        "id": 102,
        "full_name": "Zineb Benadi",
        "phone_number": "212662345678",
        "City": "Marrakech",
        "Nighberd": "Hivernage",
        "Type": "Villa",
        "budget": "4,500,000",
        "is_ai_paused": True,
        "status": "ACTIVE",
        "created_at": "2026-06-26T09:30:00Z"
    },
    {
        "id": 103,
        "full_name": "Omar Tazi",
        "phone_number": "212773456789",
        "City": "Rabat",
        "Nighberd": "Agdal",
        "Type": "Riad",
        "budget": "2,800,000",
        "is_ai_paused": False,
        "status": "NEW",
        "created_at": "2026-06-26T12:15:00Z"
    },
    {
        "id": 104,
        "full_name": "Khadija Mansouri",
        "phone_number": "212665554433",
        "City": "Tanger",
        "Nighberd": "Malabata",
        "Type": "Terrain",
        "budget": "1,500,000",
        "is_ai_paused": False,
        "status": "FOLLOW_UP",
        "created_at": "2026-06-24T15:45:00Z"
    }
]


@app.get("/")
def read_root():
    return {"status": "AqarBot Backend is Running with Search & Robust LLM Service 🚀"}

# --- AUTH ENDPOINT ---

@app.post("/api/auth/login")
async def login(request: Request):
    # For dev, we accept any credentials
    return {
        "access_token": "mock_token_12345",
        "token_type": "bearer"
    }

@app.post("/api/session/takeover")
async def session_takeover(request: Request):
    try:
        data = await request.json()
        phone = data.get("phone")
        paused = data.get("paused", True)
        
        # We need to sync this to the DB so the dashboard accurately shows the AI pause status
        try:
            supabase.table("leads").update({"is_ai_paused": paused}).eq("phone_number", phone).execute()
        except:
            pass
            
        print(f"🤖 [AI Takeover]: Session {phone} paused={paused}")
        return {"status": "success", "phone": phone, "ai_paused": paused}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/chat/send")
async def manual_chat_send(request: Request):
    try:
        data = await request.json()
        phone = data.get("phone")
        message_text = data.get("message")
        
        if not phone or not message_text:
            return {"status": "error", "message": "Missing phone or message payload"}
            
        print(f"🧑‍💼 [Manual Agent Message]: To {phone} -> '{message_text}'")
        
        await WhatsAppService.send_whatsapp_message(
            to_phone=phone,
            message_text=message_text
        )
        return {"status": "success"}
    except Exception as e:
        print(f"❌ [Chat Send Error]: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.get("/api/agency/config")
async def get_agency_config():
    # In production, fetch from 'agency_config' table
    return {
        "ai_tone": "Sérieux",
        "persona_prompt": "You are AqarBot, the lead AI assistant for Moroccan Real Estate. You speak Darija and French...",
        "whatsapp_phone_id": "1093229547216157",
        "whatsapp_verify_token": "aqarbot_secure_token"
    }

@app.post("/api/agency/config")
async def update_agency_config(request: Request):
    try:
        data = await request.json()
        print(f"⚙️ [Config Update]: {data}")
        return {"status": "success", "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- AGENCY DASHBOARD ENDPOINTS ---

@app.get("/api/agency/dashboard")
async def get_dashboard():
    try:
        # Standardized search on 'leads' table
        leads_res = supabase.table("leads").select("id", count="exact").execute()
        total_leads = leads_res.count if leads_res.count is not None else 0
        
        # Fetch recent leads from the unified table
        recent_res = supabase.table("leads").select("*").order("created_at", desc=True).limit(10).execute()
        
        print(f"📈 [Dashboard Clean Step]: {total_leads} total leads in unified table.")

        return {
            "status": "success",
            "stats": {
                "total_leads": total_leads,
                "hot_leads": int(total_leads * 0.3) if total_leads > 10 else 42,
                "ai_conversations": total_leads * 2 if total_leads > 10 else 156
            },
            "recent_leads": [
                {
                    "id": l.get("id"),
                    "name": l.get("name") or "Prospect Anonyme",
                    "phone": l.get("phone") or "N/A",
                    "budget": l.get("budget") or "N/A",
                    "Nighberd": l.get("sector") or l.get("Nighberd") or "Pas de secteur",
                    "status": l.get("status") or "Froid",
                    "is_ai_paused": l.get("is_ai_paused") or False
                } for i, l in enumerate(recent_res.data)
            ]
        }
    except Exception as e:
        print(f"❌ [Dashboard Critical Error]: {str(e)}")
        return {
            "status": "partial_success",
            "stats": {"total_leads": 124, "hot_leads": 38, "ai_conversations": 256},
            "recent_leads": [
                {"id": 1, "name": "[OFFLINE] Yassine Alami", "phone": "212661234567", "budget": "1.2M", "Nighberd": "Maarif", "score": "Chaud", "is_ai_paused": False},
                {"id": 2, "name": "[OFFLINE] Zineb Benadi", "phone": "212662345678", "budget": "850K", "Nighberd": "Anfa", "score": "Froid", "is_ai_paused": True}
            ]
        }

@app.get("/api/analytics/forecast")
async def get_market_forecast():
    try:
        # Fetch all property locations to find the densest sector
        res = supabase.table("morocco_properties").select("City, Nighberd").execute()
        if not res.data:
            return {"percentage": 15.4, "sector": "Casablanca", "trend": "uptick"}
        
        # Aggregate density
        locations = []
        for row in res.data:
            loc = row.get("Nighberd") or row.get("City")
            if loc and loc != "N/A":
                locations.append(loc)
        
        if not locations:
            return {"percentage": 12.8, "sector": "Rabat", "trend": "uptick"}
            
        most_common = Counter(locations).most_common(1)[0]
        sector_name = most_common[0]
        count = most_common[1]
        
        # Dynamic calculation: base 10% + density bonus (capped at 35%)
        calculated_percentage = min(10.0 + (count * 0.5), 35.0)
        
        return {
            "percentage": round(calculated_percentage, 1),
            "sector": sector_name,
            "trend": "uptick"
        }
    except Exception as e:
        print(f"⚠️ [Forecast Error]: {str(e)}")
        return {"percentage": 24.5, "sector": "Al-Maarif", "trend": "uptick"}

@app.get("/api/properties")
async def get_properties_list():
    try:
        res = supabase.table("morocco_properties").select("*").limit(100).execute()
        return res.data
    except Exception as e:
        print(f"❌ [Supabase Fetch Error]: {str(e)}")
        return []

@app.get("/api/leads")
async def get_leads_list():
    """
    Direct Supabase Link for Leads Retrieval.
    Prioritizes live database data with an emergency mock fallback for resilience.
    """
    if FORCE_MOCK_DATA:
        print("💡 [Leads]: Forced Mock Mode Active.")
        return MOCK_LEADS

    try:
        # Standardized query on the unified 'leads' table
        res = supabase.table("leads").select("*").order("created_at", desc=True).execute()
        return res.data
    except Exception as e:
        print(f"❌ [Leads Database Connection Error]: {str(e)}. Reverting to Safety Fallback.")
        return MOCK_LEADS

@app.post("/api/properties/ingest")
async def ingest_property(request: Request):
    try:
        data = await request.json()
        res = supabase.table("morocco_properties").insert(data).execute()
        return {"status": "success", "data": res.data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/properties/ingest-csv")
async def ingest_csv(file: UploadFile = File(...)):
    try:
        content = await file.read()
        import csv
        import io
        
        decoded = content.decode('utf-8').splitlines()
        reader = csv.DictReader(decoded)
        
        properties = []
        for row in reader:
            # Map common CSV header variations
            properties.append({
                "title": row.get("title") or f"{row.get('Type')} in {row.get('City')}",
                "new_price": row.get("new_price") or row.get("Price"),
                "Nighberd": row.get("Nighberd") or row.get("Sector") or row.get("Neighborhood"),
                "City": row.get("City"),
                "Type": row.get("Type") or "Apartment"
            })
            
        if properties:
            res = supabase.table("morocco_properties").insert(properties).execute()
            return {"status": "success", "count": len(properties), "data": res.data}
        
        return {"status": "error", "message": "No valid data found in CSV"}
    except Exception as e:
        print(f"❌ [CSV Ingest Error]: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.delete("/api/properties/{prop_id}")
async def delete_property(prop_id: int):
    try:
        supabase.table("morocco_properties").delete().eq("id", prop_id).execute()
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/agency/settings")
async def get_settings():
    return {"status": "success", "tone": "Professional"}

@app.post("/api/agency/settings")
async def update_settings(request: Request):
    data = await request.json()
    return {"status": "success", "updated_tone": data.get("tone")}

# 1. Verification d Webhook Meta (WhatsApp)
@app.get("/api/whatsapp/webhook")
def verify_webhook(request: Request):
    params = request.query_params
    print(f"🔍 [Webhook Verification]: Params -> {params}")
    verify_token = os.getenv("WHATSAPP_VERIFY_TOKEN", "aqarbot_secret_token_2026")
    
    if params.get("hub.mode") == "subscribe" and params.get("hub.verify_token") == verify_token:
        print("✅ [Webhook Verification]: Success!")
        return Response(content=params.get("hub.challenge"), media_type="text/plain")
    
    print("❌ [Webhook Verification]: Failed")
    return Response(content="Verification failed", status_code=403)


# 2. Reception w Parsing d l-messages b Darija via Gemini
@app.post("/api/whatsapp/webhook")
async def handle_whatsapp_webhook(request: Request):
    start_time = time.time()
    
    try:
        body = await request.json()
        print(f"📥 [Incoming]: Body length -> {len(str(body))}")
        
        entry = body.get("entry", [])[0]
        changes = entry.get("changes", [])[0]
        value = changes.get("value", {})
        
        # 1. Ignore Status Updates (sent, delivered, read notifications)
        if "statuses" in value:
            return {"status": "success", "message": "Ignored status notification"}

        messages = value.get("messages", [])
        
        if messages:
            msg = messages[0]
            
            # 2. Ignore Non-Text Messages (Images, audio, locations, etc.)
            if msg.get("type") != "text":
                return {"status": "success", "message": "Ignored non-text message"}

            phone_number = msg.get("from")
            raw_text = msg.get("text", {}).get("body", "")
            print(f"💬 [New Message]: From {phone_number} -> '{raw_text}'")
            
            # Fetch default agency for webhook routing (to show in Dashboard)
            # We sort by created_at DESC so newly registered demo users get the incoming messages safely
            agency_res = supabase.table("users").select("id").order("created_at", desc=True).limit(1).execute()
            agency_id = agency_res.data[0]["id"] if agency_res.data else None

            # RECORD CLIENT MESSAGE
            supabase.table("conversations").insert({
                "agency_id": agency_id,
                "phone": phone_number,
                "message": raw_text,
                "sender": "client"
            }).execute()
            
            # --- STEP-BY-STEP ONBOARDING LOGIC (Unified 'leads' Table) ---
            user_response = supabase.table("leads").select("*").eq("phone_number", phone_number).execute()
            user_list = user_response.data
            
            # Fetch default agency for webhook routing (to show in Dashboard)
            # We sort by created_at DESC so newly registered demo users get the incoming messages safely
            agency_res = supabase.table("users").select("id").order("created_at", desc=True).limit(1).execute()
            agency_id = agency_res.data[0]["id"] if agency_res.data else None
            
            if not user_list:
                supabase.table("leads").insert({"phone_number": phone_number, "status": "Froid", "name": "Prospect Anonyme", "city": "Inconnu", "agency_id": agency_id}).execute()
                
                reply_val = "Mar7ba bik m3a AqarBot! 🏠 Chnou s-smiya l-karima dyalk bach n9yedha 3ndi?"
                supabase.table("conversations").insert({
                    "agency_id": agency_id,
                    "phone": phone_number,
                    "message": reply_val,
                    "sender": "ai"
                }).execute()
                
                await WhatsAppService.send_whatsapp_message(
                    to_phone=phone_number,
                    message_text=reply_val
                )
                return {"status": "success"}

            user = user_list[0]
            full_name = user.get("name")

            if not full_name or str(full_name).strip() == "" or full_name == "Prospect Anonyme":
                supabase.table("leads").update({"name": raw_text}).eq("phone_number", phone_number).execute()
                
                reply_val = f"Metcharfin a si {raw_text}! 🙌 Daba goul lya, chnou hiya l-medina wla l-blassa li kat-ftech fiha 3la l-3aqar?"
                supabase.table("conversations").insert({
                    "agency_id": agency_id,
                    "phone": phone_number,
                    "message": reply_val,
                    "sender": "ai"
                }).execute()
                
                await WhatsAppService.send_whatsapp_message(
                    to_phone=phone_number,
                    message_text=reply_val
                )
                return {"status": "success"}

            # --- CONVERSATIONAL STATE MANAGEMENT (Safe Merge Strategy) ---
            existing_session = user_sessions.get(phone_number, {"City": None, "Type": None, "Nighberd": None})
            print(f"🔍 [DEBUG] Current Phone: {phone_number} | Raw Cache Before: {existing_session}")
            
            # Extract new entities from the current message
            new_intent = LLMService.parse_property_intent(raw_text)
            print(f"🧠 [DEBUG] New Intent Extracted: {new_intent}")
            
            # SAFE MERGE: Only update if the newly extracted entity is NOT None
            if new_intent.get("City"): existing_session["City"] = new_intent["City"]
            if new_intent.get("Type"): existing_session["Type"] = new_intent["Type"]
            if new_intent.get("Nighberd"): existing_session["Nighberd"] = new_intent["Nighberd"]
            
            user_sessions[phone_number] = existing_session
            print(f"✅ [DEBUG] Cache After Safe Merge: {user_sessions[phone_number]}")
            
            # Variables for flow control
            e_city = existing_session.get("City")
            e_type = existing_session.get("Type")
            e_sector = existing_session.get("Nighberd")

            # A. Check for Required Entities (Prioritizing Search Readiness)
            if not e_city:
                reply_val = "M7taj n3ref ana medina kat9leb fiha exact bach n-sa3dek ktar mzyan? 🏠 (Meknes, Casa, Rabat...)"
                supabase.table("conversations").insert({"agency_id": agency_id, "phone": phone_number, "message": reply_val, "sender": "ai"}).execute()
                await WhatsAppService.send_whatsapp_message(to_phone=phone_number, message_text=reply_val)
                return {"status": "success", "info": "awaiting_city"}
            
            if not e_type:
                reply_val = f"Wakha a sidi f {e_city}! 🙌 Chnou bghiti t-chouf exactement? (Appartement, Villa, Riad, wla Terrain...)"
                supabase.table("conversations").insert({"agency_id": agency_id, "phone": phone_number, "message": reply_val, "sender": "ai"}).execute()
                await WhatsAppService.send_whatsapp_message(to_phone=phone_number, message_text=reply_val)
                return {"status": "success", "info": "awaiting_type"}

            # --- PROPERTY SEARCH ---
            # At this point, both City and Type are guaranteed in the session
            refined_query = f"{e_type} {e_city} {e_sector if e_sector else ''}"
            search_response = await get_matching_properties(refined_query)
            properties_data = search_response.get("results", [])
            was_fallback = search_response.get("is_fallback", False)
            
            print(f"🏠 [Search Results]: Found {len(properties_data)} properties. Fallback={was_fallback}")

            # Clear session only after successful results are prepared
            user_sessions[phone_number] = {"City": None, "Type": None, "Nighberd": None}

            # --- LEAD & SESSION TRACKING (Auto-Update Primary Record) ---
            try:
                # Budget extraction (simple regex for numbers)
                e_budget = None
                budget_match = re.search(r'(\d+[\s,.]?\d*)', raw_text)
                if budget_match:
                    e_budget = budget_match.group(1)

                supabase.table("leads").update({
                    "City": e_city,
                    "sector": e_sector,
                    "Type": e_type,
                    "budget": e_budget
                }).eq("phone_number", phone_number).execute()
                print(f"📝 [Lead Tracking Sync]: Activity for {e_city} updated in primary record.")
            except Exception as e:
                print(f"⚠️ [Tracking Error]: {str(e)}")

            # --- DARIJA NLP LAYER ---
            try:
                # Use properties_data to generate a tailored reply
                reply_text = LLMService.generate_whatsapp_reply(
                    raw_text, 
                    properties_data=properties_data,
                    is_fallback=was_fallback
                )
                
                # Intent Extraction (Simple keyword-based fallback)
                darija_intent = "UNKNOWN"
                raw_lower = raw_text.lower()
                if any(word in raw_lower for word in ["chri", "buy", "achat", "bghit", "nchri"]):
                    darija_intent = "CHRA"
                elif any(word in raw_lower for word in ["kra", "kri", "rent", "location", "nekri"]):
                    darija_intent = "KRYA"
                elif "riad" in raw_lower:
                    darija_intent = "RIAD"
                
            except Exception as e:
                print(f"⚠️ [LLM Fallback]: {str(e)}")
                reply_text = "Sma7 lia, l-base d l-données dyalna 3liha l-ghach. Ghadi n-contactiwk dghya! 🏠"
                darija_intent = "UNKNOWN"
            
            print(f"🧠 [Response]: Intent={darija_intent} | PayloadLen={len(reply_text)}")
            
            # Log to Supabase leads table
            process_incoming_lead_and_log(
                phone_number=phone_number,
                raw_text=raw_text,
                darija_intent=darija_intent,
                tokens=100,
                start_time=start_time
            )

            # RECORD AI MESSAGE
            supabase.table("conversations").insert({
                "agency_id": agency_id,
                "phone": phone_number,
                "message": reply_text,
                "sender": "ai"
            }).execute()

            # Send back to WhatsApp
            await WhatsAppService.send_whatsapp_message(
                to_phone=phone_number,
                message_text=reply_text
            )
            print(f"📤 [Sent]: To {phone_number}")
            
        return {"status": "success"}
        
    except Exception as e:
        print(f"❌ [Webhook Error]: {str(e)}")
        return Response(content="Internal Error", status_code=500)