import os
import httpx
import json
import traceback

class WhatsAppService:
    @staticmethod
    async def send_whatsapp_message(to_phone: str, message_text: str) -> bool:
        """
        Sends a raw text WhatsApp message to a client using Meta Cloud API.
        """
        
        access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
        phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
        
        print(f"\n--- WHATSAPP OUTBOUND START ---")
        print(f"DEBUG: Target Phone: {to_phone}")
        
        if not access_token or not phone_number_id:
            print("ERROR: Meta WhatsApp credentials missing in .env. Skipping real-time envoy.")
            print(f"DEBUG: access_token present: {bool(access_token)}")
            print(f"DEBUG: phone_number_id present: {bool(phone_number_id)}")
            return False

        # Correct Outbound Endpoint URL (v25.0)
        # We ensure it uses WHATSAPP_PHONE_NUMBER_ID and NOT Business Account ID
        url = f"https://graph.facebook.com/v25.0/{phone_number_id}/messages"
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        # Masking token for logs
        masked_token = access_token[:10] + "..." + access_token[-10:] if access_token else "NONE"
        print(f"DEBUG: URL: {url}")
        print(f"DEBUG: Headers: {{'Authorization': 'Bearer {masked_token}', 'Content-Type': 'application/json'}}")
        
        # Payload format required by Meta Cloud API
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to_phone,
            "type": "text",
            "text": {
                "preview_url": False,
                "body": message_text
            }
        }

        print(f"DEBUG: Structured Payload to Meta:\n{json.dumps(payload, indent=2)}")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=headers)
                
                print(f"DEBUG: Meta API Response Status: {response.status_code}")
                
                try:
                    response_json = response.json()
                    print(f"DEBUG: Meta API Response Body:\n{json.dumps(response_json, indent=2)}")
                except Exception:
                    print(f"DEBUG: Meta API Response Raw Body: {response.text}")
                
                if response.status_code in [200, 201]:
                    print(f"SUCCESS: WhatsApp message successfully sent to client: {to_phone}")
                    print(f"--- WHATSAPP OUTBOUND END ---\n")
                    return True
                else:
                    print(f"ERROR: Meta API Failed with status {response.status_code}")
                    print(f"--- WHATSAPP OUTBOUND END ---\n")
                    return False
                    
        except Exception as e:
            print(f"❌ CRITICAL EXCEPTION in WhatsAppService:")
            print(traceback.format_exc())
            print(f"--- WHATSAPP OUTBOUND END ---\n")
            return False
