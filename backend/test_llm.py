import sys
import os

# Add the project root to sys.path
sys.path.append(os.getcwd())

from dotenv import load_dotenv
load_dotenv()

from app.services.llm_service import LLMService

def test_llm():
    try:
        reply = LLMService.generate_whatsapp_reply(
            client_message="I want a house in Hamria",
            properties_data=[]
        )
        print(f"Reply: {reply}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_llm()
