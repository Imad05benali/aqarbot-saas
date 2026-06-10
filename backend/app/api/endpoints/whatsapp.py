import os
import json
import traceback
from fastapi import APIRouter, Request, HTTPException, Query
from fastapi.responses import PlainTextResponse
from app.services.vector_service import VectorService
from app.services.llm_service import LLMService
from app.services.whatsapp_service import WhatsAppService
from app.api.endpoints.properties import search_properties

router = APIRouter()

VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "aqarbot_secret_token_2026")

@router.get("/webhook")
async def whatsapp_verify(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: int = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token")
):
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        print("INFO: WhatsApp Webhook Verified Successfully!")
        return PlainTextResponse(str(hub_challenge))
    raise HTTPException(status_code=403, detail="Verification token mismatch")

@router.post("/webhook")
async def whatsapp_webhook(request: Request):
    """
    DYNAMIC POST WEBHOOK: 
    1. Extracts client_phone from Meta payload (no hardcoding).
    2. Searches ChromaDB/Supabase.
    3. Generates AI response in Darija.
    4. Sends it back to the REAL sender.
    """
    print(f"\n--- INCOMING WHATSAPP WEBHOOK START ---")
    try:
        payload = await request.json()
        print(f"DEBUG: Full Incoming Payload:\n{json.dumps(payload, indent=2)}")
        
        # Meta payload parsing starts here
        if "entry" in payload and payload["entry"]:
            for entry in payload["entry"]:
                for change in entry.get("changes", []):
                    value = change.get("value", {})
                    
                    # LOG: See what kind of value we got
                    if "statuses" in value:
                        status_obj = value['statuses'][0]
                        print(f"INFO: Received Status Update: {status_obj.get('status')} for {status_obj.get('recipient_id')}")
                        if "errors" in status_obj:
                            print(f"ERROR: Meta Status Error: {json.dumps(status_obj.get('errors'), indent=2)}")
                        continue

                    if "messages" in value and value["messages"]:
                        message_obj = value["messages"][0]
                        
                        # --- CRITICAL DYNAMIC EXTRACTION ---
                        # We prioritize wa_id from contacts, then fall back to 'from'
                        client_phone = message_obj.get("from")
                        if "contacts" in value and value["contacts"]:
                            client_phone = value["contacts"][0].get("wa_id", client_phone)
                        
                        if not client_phone:
                            print("WARN: Could not extract sender phone number. Skipping...")
                            continue

                        if message_obj.get("type") == "text":
                            client_text = message_obj.get("text", {}).get("body", "").strip()
                            print(f"MESSAGE: Real Client ({client_phone}) sent: '{client_text}'")
                            
                            # 1. Semantic Search (RAG)
                            print(f"SEARCH: Searching ChromaDB for: '{client_text}'...")
                            try:
                                search_results = await search_properties(query=client_text, limit=3)
                                properties_list = search_results.get("properties", [])
                                print(f"DEBUG: Found {len(properties_list)} properties.")
                            except Exception as e:
                                print(f"ERROR: Search failed: {str(e)}")
                                properties_list = []
                            
                            # 2. Gemini AI Response Generation
                            print("AI: Generating Darija response via Gemini Pro...")
                            try:
                                ai_reply = LLMService.generate_whatsapp_reply(
                                    client_message=client_text, 
                                    properties_data=properties_list
                                )
                                print(f"DEBUG: AI Reply generated (length: {len(ai_reply)})")
                            except Exception as e:
                                print(f"ERROR: AI Generation failed: {str(e)}")
                                ai_reply = "Sma7 lina, wa9e3 mouchkil sghir f-nxam. Ghadi njawbouk f-a9rab wa9t."
                            
                            # 3. Send AI Reply back to the REAL SENDER
                            print(f"SEND: DYNAMIC SEND: Sending back to {client_phone}...")
                            success = await WhatsAppService.send_whatsapp_message(
                                to_phone=client_phone,
                                message_text=ai_reply
                            )
                            print(f"DEBUG: Send Message Status: {'SUCCESS' if success else 'FAILED'}")
                        else:
                            print(f"INFO: Ignoring non-text message of type: {message_obj.get('type')}")
                            
        print(f"--- INCOMING WHATSAPP WEBHOOK END ---\n")
        return {"status": "received"}
        
    except Exception as e:
        print(f"❌ CRITICAL ERROR in Webhook Pipeline:")
        print(traceback.format_exc())
        print(f"--- INCOMING WHATSAPP WEBHOOK END ---\n")
        return {"status": "error", "detail": str(e)}
