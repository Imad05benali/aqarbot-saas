import requests
import json

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
              "display_phone_number": "212600000000",
              "phone_number_id": "123456789"
            },
            "contacts": [{"profile": {"name": "Imad"}, "wa_id": "212600000000"}],
            "messages": [
              {
                "from": "212600000000",
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

response = requests.post(url, headers=headers, data=json.dumps(payload))
print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")