import os
import json
from fastapi import APIRouter, Request, HTTPException, Query
from fastapi.responses import PlainTextResponse
from app.services.vector_service import VectorService
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
    POST Webhook: Receives real WhatsApp messages, extracts text,
    queries ChromaDB, and logs the matches.
    """
    try:
        # Read raw body first to check for empty content
        body = await request.body()
        if not body:
            print("⚠️ Received empty request body")
            return {"status": "error", "detail": "Empty request body"}

        payload = json.loads(body)
        print("📩 Incoming WhatsApp Payload:", json.dumps(payload, indent=2))
        
        # 1. Structure Check: Extract message data from Meta's complex JSON payload
        if "entry" in payload and payload["entry"]:
            changes = payload["entry"][0].get("changes", [])
            if changes and "value" in changes[0]:
                value = changes[0]["value"]
                
                # Check if it's a real incoming text message
                if "messages" in value and value["messages"]:
                    message_obj = value["messages"][0]
                    client_phone = message_obj.get("from") # Client WhatsApp number
                    
                    if message_obj.get("type") == "text":
                        client_text = message_obj.get("text", {}).get("body", "").strip()
                        print(f"💬 Client ({client_phone}) sent: '{client_text}'")
                        
                        # 2. Trigger Semantic Search automatically using the client's text
                        print(f"🔍 Searching ChromaDB for: '{client_text}'...")
                        search_results = await search_properties(query=client_text, limit=3)
                        
                        # 3. Log what the system found (This will be formatted by the LLM later)
                        print(f"🎯 Search results linked to WhatsApp flow: {search_results}")
                        
        return {"status": "received"}
        
    except json.JSONDecodeError:
        print("❌ Invalid JSON received")
        return {"status": "error", "detail": "Invalid JSON format"}
    except Exception as e:
        print(f"❌ Error processing incoming webhook data: {str(e)}")
        return {"status": "error", "detail": str(e)}