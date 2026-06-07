import os
import httpx

class WhatsAppService:
    @staticmethod
    async def send_whatsapp_message(to_phone: str, message_text: str) -> bool:
        """
        Sends a raw text WhatsApp message to a client using Meta Cloud API.
        """
        
        access_token = os.getenv("WHATSAPP_ACCESS_TOKEN")
        phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
        
        if not access_token or not phone_number_id:
            print(" Meta WhatsApp credentials missing in .env. Skipping real-time envoi.")
            return False

        url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
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

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=headers)
                
                if response.status_code == 200:
                    print(f"🚀 WhatsApp message successfully sent to client: {to_phone}")
                    return True
                else:
                    print(f"❌ Meta API Error ({response.status_code}): {response.text}")
                    return False
                    
        except Exception as e:
            print(f"❌ Exception occurred while sending WhatsApp message: {str(e)}")
            return False