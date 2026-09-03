import os
import json
import traceback
import logging
from fastapi import APIRouter, Request, HTTPException, Query, Response
from fastapi.responses import PlainTextResponse
from app.services.llm_service import LLMService
from app.services.whatsapp_service import WhatsAppService
from app.services.lead_service import LeadService
from app.api.endpoints.properties import search_properties
from app.core.supabase import supabase

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

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

                    # 3. LLM State Machine Routing
                    try:
                        import re
                        import json
                        
                        llm_response = LLMService.chat_with_agent(client_phone, client_text, agency_id)
                        print(f"LLM RESPONSE: {llm_response}")
                        
                        # Strip markdown JSON backticks if present
                        json_str = llm_response
                        if "```json" in json_str:
                            match = re.search(r"```json\n(.*?)```", json_str, re.DOTALL)
                            if match:
                                json_str = match.group(1).strip()
                        elif "```" in json_str:
                            match = re.search(r"```\n(.*?)```", json_str, re.DOTALL)
                            if match:
                                json_str = match.group(1).strip()
                                
                        is_json = False
                        parsed_json = {}
                        if json_str.startswith("{") and json_str.endswith("}"):
                            try:
                                parsed_json = json.loads(json_str)
                                is_json = True
                            except json.JSONDecodeError:
                                pass
                                
                        if not is_json:
                            # Plain text conversation
                            await WhatsAppService.send_whatsapp_message(client_phone, llm_response)
                        else:
                            status = parsed_json.get("status")
                            if status == "ready_to_search":
                                # Execute search
                                operation = parsed_json.get("operation", "")
                                city = parsed_json.get("city", "")
                                prop_type = parsed_json.get("property_type", "")
                                budget = str(parsed_json.get("max_budget", ""))
                                search_query = f"{operation} {city} {prop_type} {budget}".strip()
                                
                                search_results = await search_properties(query=search_query, limit=3)
                                props = search_results.get("properties", []) if isinstance(search_results, dict) else []
                                
                                # Format properties as system message to feed back to LLM
                                context = "SYSTEM: Search completed. Present these properties concisely:\n"
                                if props:
                                    for p in props:
                                        # Use image_url if available, else fallback
                                        img = p.get('image_url', 'N/A')
                                        context += f"- Title: {p.get('title')} | Price: {p.get('new_price')} DH | City: {p.get('City')} | image_url: {img}\n"
                                else:
                                    context += "No properties found matching criteria."
                                    
                                # Ask LLM for the presentation message
                                presentation_msg = LLMService.chat_with_agent(client_phone, context, agency_id)
                                await WhatsAppService.send_whatsapp_message(client_phone, presentation_msg)
                                
                            elif status == "send_image":
                                img_url = parsed_json.get("image_url")
                                caption = parsed_json.get("caption", "Here is the property!")
                                if img_url:
                                    await WhatsAppService.send_whatsapp_image(client_phone, img_url, caption)
                                else:
                                    await WhatsAppService.send_whatsapp_message(client_phone, caption)
                    
                    except Exception as inner_e:
                        logger.error(f"⚠️ WEBHOOK INNER ERROR: {str(inner_e)}", exc_info=True)
                        fallback = "Sma7 lia bzaf, kayn chi mouchkil tekniki daba. Ghadi n-jawbek dghia ghir issebek l-fara7! 🏠"
                        await WhatsAppService.send_whatsapp_message(client_phone, fallback)
                            
        logger.info(f"--- INCOMING WHATSAPP WEBHOOK END ---\n")
        return {"status": "received"}
        
    except Exception as e:
        logger.error(f"❌ CRITICAL WEBHOOK ERROR: {str(e)}", exc_info=True)
        return {"status": "error", "detail": str(e)}
