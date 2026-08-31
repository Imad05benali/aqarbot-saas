import requests
import json

URL = "http://localhost:8000/api/chatbot/simulate"
HEADERS = {"X-Agency-Id": "9085ea23-69dd-48e8-b594-87d7f2657d57"}
PHONE = "test_python_flow_99"

messages = [
    "Salam",                 # State: GREETING -> transition to AWAITING_NAME
    "Rachid",                # State: AWAITING_NAME -> transition to AWAITING_TYPE (sets name=Rachid)
    "Appartement",           # State: AWAITING_TYPE -> transition to AWAITING_CITY (sets Type=Appartement)
    "Casablanca",            # State: AWAITING_CITY -> transition to AWAITING_SECTOR (sets City=Casablanca)
    "Maarif",                # State: AWAITING_SECTOR -> transition to AWAITING_BUDGET (sets sector/neighborhood=Maarif)
    "500,000 DH"             # State: AWAITING_BUDGET -> transition to QUALIFIED (sets budget=500000 DH, outputs confirmation)
]

for i, msg in enumerate(messages, 1):
    print(f"\n--- Step {i}: Client Message: '{msg}' ---")
    payload = {
        "phone": PHONE,
        "message": msg,
        "sender": "client"
    }
    r = requests.post(URL, headers=HEADERS, json=payload)
    print("Response Status:", r.status_code)
    try:
        data = r.json()
        print("Resolved Agency ID:", data.get("agency_id"))
        print("Reply:\n", data.get("ai_reply"))
    except Exception as e:
        print("Error parsing response:", e)
        print("Raw Content:", r.text)
