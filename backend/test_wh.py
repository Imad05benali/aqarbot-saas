import httpx
import json
import asyncio

async def main():
    url = "http://127.0.0.1:8000/api/whatsapp/webhook"
    headers = {"Content-Type": "application/json"}

    payload = {
      "object": "whatsapp_business_account",
      "entry": [
        {
          "id": "123456789",
          "changes": [
            {
              "value": {
                "messaging_product": "whatsapp",
                "metadata": {
                  "display_phone_number": "2126659347298",
                  "phone_number_id": "123456789"
                },
                "contacts": [{"profile": {"name": "Imad"}, "wa_id": "2126659347298"}],
                "messages": [
                  {
                    "from": "2126659347298",
                    "id": "wamid.HBgNMjEyNjAwMDAwMDAwFQIAERgSQjM0NTY3ODlBQkNERUZHSAA=",
                    "timestamp": "1717610000",
                    "text": {
                      "body": "Chambre n9iya f Hamria"
                    },
                    "type": "text"
                  }
                ]
              },
              "field": "messages"
            }
          ]
        }
      ]
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")

if __name__ == "__main__":
    asyncio.run(main())
