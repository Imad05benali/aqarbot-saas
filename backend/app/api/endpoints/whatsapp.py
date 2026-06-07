import os
import json
from fastapi import APIRouter, Request, HTTPException, Query
from fastapi.responses import PlainTextResponse
from app.services.vector_service import VectorService
from app.services.llm_service import LLMService
from app.services.whatsapp_service import WhatsAppService  # Import dynamic sender jdid
from app.api.endpoints.properties import search_properties

router = APIRouter()

VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "aqarbot_secret_token_2026")

@router.get("/webhook")
async def whatsapp_verify(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: int = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token")
):
    """
    GET Webhook endpoint for Meta API verification process.
    """
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        print("✅ WhatsApp Webhook Verified Successfully!")
        return PlainTextResponse(str(hub_challenge))
    
    raise HTTPException(status_code=403, detail="Verification token mismatch or invalid hub.mode")


@router.post("/webhook")
async def whatsapp_webhook(request: Request):
    """
    POST Webhook: Complete pipeline for AqarBot SaaS.
    Extracts text, searches vector DB, requests Gemini AI Darija reply, and sends back to client.
    """
    try:
        payload = await request.json()
        print("📩 Incoming WhatsApp Payload:", json.dumps(payload, indent=2))
        
        if "entry" in payload and payload["entry"]:
            changes = payload["entry"][0].get("changes", [])
            if changes and "value" in changes[0]:
                value = changes[0]["value"]
                
                if "messages" in value and value["messages"]:
                    message_obj = value["messages"][0]
                    client_phone = message_obj.get("from")  # Dynamic client phone number
                    
                    if message_obj.get("type") == "text":
                        client_text = message_obj.get("text", {}).get("body", "").strip()
                        print(f"💬 Client ({client_phone}) sent: '{client_text}'")
                        
                        # 1. Semantic Search
                        print(f"🔍 Searching ChromaDB for: '{client_text}'...")
                        search_results = await search_properties(query=client_text, limit=3)
                        properties_list = search_results.get("properties", [])
                        
                        # 2. AI Vibe Generation (Darija)
                        print("🧠 Generating AI response via Gemini Pro...")
                        ai_reply = LLMService.generate_whatsapp_reply(
                            client_message=client_text, 
                            properties_data=properties_list
                        )
                        
                        print("\n=================== 🤖 AQARBOT AI REPLY ===================")
                        print(ai_reply)
                        print("===========================================================\n")
                        
                        # 3. Meta API Sender (Trigger real-time response back to the client)
                        print(f"📲 Attempting to send message back to {client_phone} via Meta API...")
                        await WhatsAppService.send_whatsapp_message(
                            to_phone=client_phone,
                            message_text=ai_reply
                        )
                        
        return {"status": "received"}
        
    except Exception as e:
        print(f"❌ Error processing incoming webhook data: {str(e)}")
        return {"status": "error", "detail": str(e)}