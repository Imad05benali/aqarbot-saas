import os
import json
import traceback
from fastapi import APIRouter, Request, HTTPException, Query, Response
from fastapi.responses import PlainTextResponse
from app.services.llm_service import LLMService
from app.services.whatsapp_service import WhatsAppService
from app.services.lead_service import LeadService
from app.api.endpoints.properties import search_properties
from app.core.supabase import supabase

router = APIRouter()

VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN", "aqarbot_secret_token_2026")

# In-memory session store (Simple State Machine)
sessions = {}
# Deduplication store
processed_messages = set()

def _resolve_agency_for_router(phone_number: str = None) -> str:
    """Resolve agency_id: first from existing lead, then fallback to newest user."""
    if phone_number:
        try:
            existing = supabase.table("leads").select("agency_id").eq("phone_number", phone_number).limit(1).execute()
            if existing.data and existing.data[0].get("agency_id"):
                return existing.data[0]["agency_id"]
        except Exception:
            pass
    try:
        agency_res = supabase.table("users").select("id").order("created_at", desc=True).limit(1).execute()
        if agency_res.data:
            return agency_res.data[0]["id"]
    except Exception:
        pass
    return None

@router.get("/webhook")
async def whatsapp_verify(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token")
):
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        print("INFO: WhatsApp Webhook Verified Successfully!")
        return PlainTextResponse(content=hub_challenge)
    raise HTTPException(status_code=403, detail="Verification token mismatch")

@router.post("/webhook")
async def whatsapp_webhook(request: Request):
    """
    POLISHED PRODUCTION WEBHOOK:
    - Token-based search synchronization.
    - Defensive error handling with traceback logging.
    - Message deduplication.
    """
    print(f"\n--- INCOMING WHATSAPP WEBHOOK START ---")
    try:
        payload = await request.json()
        
        if "entry" not in payload:
            return {"status": "no entry"}

        for entry in payload["entry"]:
            for change in entry.get("changes", []):
                value = change.get("value", {})
                
                if "statuses" in value:
                    continue

                if "messages" in value and value["messages"]:
                    message_obj = value["messages"][0]
                    client_phone = value.get("contacts", [{}])[0].get("wa_id", message_obj.get("from"))
                    
                    # 1. Deduplication
                    msg_id = message_obj.get("id")
                    if msg_id in processed_messages:
                        print(f"DEBUG: Skipping duplicate message {msg_id}")
                        continue
                    
                    if len(processed_messages) > 1000:
                        processed_messages.clear()
                    processed_messages.add(msg_id)

                    # 2. Clean input
                    client_text = message_obj.get("text", {}).get("body", "").strip()
                    print(f"MESSAGE: From {client_phone}: '{client_text}'")
                    
                    # 2.5 MULTI-TENANT: Resolve agency_id
                    agency_id = _resolve_agency_for_router(client_phone)
                    print(f"AGENCY: Resolved agency_id={agency_id} for phone={client_phone}")

                    # 3. Intent Interception
                    search_keywords = ["bghit", "dar", "villa", "appart", "chambre", "kri", "9leb", "bhgt", "fin"]
                    if any(kw in client_text.lower() for kw in search_keywords):
                        print(f"INTENT: New search detected. Resetting session state.")
                        sessions[client_phone] = {"state": "SEARCHING"}

                    session = sessions.get(client_phone, {"state": "SEARCHING"})
                    is_registered = LeadService.check_lead_exists(client_phone, agency_id=agency_id)
                    print(f"STATE: {session['state']} | Registered: {is_registered}")

                    # 4. Routing logic
                    ai_reply = ""
                    try:
                        if session["state"] == "AWAITING_NAME" and not is_registered:
                            # ROUTE 1: NAME COLLECTION
                            client_name = LLMService.extract_client_name(client_text)
                            
                            if not client_name or len(client_text.split()) == 1:
                                client_name = client_text.capitalize()
                                print(f"DEBUG: Using programmatic fallback name: {client_name}")

                            if client_name and client_name.lower() != "unknown":
                                props = session.get("last_properties", [])
                                pid = props[0].get("id") if props else None
                                
                                if LeadService.create_lead(client_phone, client_name, pid, agency_id=agency_id):
                                    sessions[client_phone] = {"state": "SEARCHING"}
                                    ai_reply = LLMService.generate_whatsapp_reply(
                                        client_message=f"My name is {client_name}", 
                                        properties_data=props,
                                        needs_lead_collection=False
                                    )
                                else:
                                    ai_reply = "Sma7 lia khoya, wa9e3 chi mouchkil f l-rejixtrasyon."
                            else:
                                ai_reply = "Sma7 lia, ma-9dertch n-ched ssmîtya dyalk. Gha 3tini ssmîtya dyalk n-9eyydek m3ana."

                        else:
                            # ROUTE 2: ROBUST TOKEN-BASED SEARCH
                            print(f"DEBUG: Executing SQL-Based Search for: {client_text}")
                            
                            # CRITICAL: Await the search function
                            search_results = await search_properties(query=client_text, limit=3)
                            
                            # Safe extraction
                            props = search_results.get("properties", []) if isinstance(search_results, dict) else []
                            print(f"DEBUG: Found {len(props)} properties.")
                            
                            needs_lead = not is_registered and len(props) > 0
                            if needs_lead:
                                print("STATE: Switching to AWAITING_NAME.")
                                sessions[client_phone] = {"state": "AWAITING_NAME", "last_properties": props}
                            
                            ai_reply = LLMService.generate_whatsapp_reply(
                                client_message=client_text, 
                                properties_data=props,
                                needs_lead_collection=needs_lead
                            )

                    except Exception as inner_e:
                        print(f"⚠️ WEBHOOK INNER ERROR: {traceback.format_exc()}")
                        ai_reply = "Sma7 lia bzaf, kayn chi mouchkil tekniki daba. Ghadi n-jawbek dghia ghir issebek l-fara7! 🏠"

                    # 5. Outbound Communication
                    if ai_reply:
                        await WhatsAppService.send_whatsapp_message(client_phone, ai_reply)
                            
        print(f"--- INCOMING WHATSAPP WEBHOOK END ---\n")
        return {"status": "received"}
        
    except Exception as e:
        print(f"❌ CRITICAL WEBHOOK ERROR: {traceback.format_exc()}")
        return {"status": "error", "detail": str(e)}
