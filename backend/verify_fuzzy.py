import os
import sys
import json
from dotenv import load_dotenv

# Add the backend directory to sys.path
sys.path.append(os.getcwd())

from app.api.endpoints.properties import search_properties
import asyncio

load_dotenv(override=True)

async def verify_fuzzy_recall():
    # Test 1: User types "Meknes" (No accent). DB has "Meknès".
    # Pattern should be "m%kn%s"
    print("Testing Fuzzy Recall for 'Meknes'...")
    resp = await search_properties(query="Meknes", limit=5)
    print(f"Results for Meknes (Fuzzy): {json.dumps(resp, indent=2)}")
    
    # Test 2: Check Bouskoura (Should still match exactly)
    print("\nTesting Recall for 'Bouskoura'...")
    resp_bousk = await search_properties(query="Bouskoura", limit=5)
    print(f"Results for Bouskoura (Fuzzy): {json.dumps(resp_bousk, indent=2)}")

if __name__ == "__main__":
    asyncio.run(verify_fuzzy_recall())
