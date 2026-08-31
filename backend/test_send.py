import asyncio
import os
import sys

# Add the project root to sys.path
sys.path.append(os.getcwd())

from dotenv import load_dotenv
load_dotenv()

from app.services.whatsapp_service import WhatsAppService

async def test_send():
    phone = "2126659347298" # Taking from test_wh.py
    message = "Test message from AqarBot debugging script 🚀"
    
    print(f"Attempting to send message to {phone}...")
    success = await WhatsAppService.send_whatsapp_message(phone, message)
    if success:
        print("SUCCESS: Message sent successfully!")
    else:
        print("ERROR: Message failed to send.")

if __name__ == "__main__":
    asyncio.run(test_send())
