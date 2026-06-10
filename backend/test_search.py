import asyncio
import sys
import os

# Add the project root to sys.path
sys.path.append(os.getcwd())

from dotenv import load_dotenv
load_dotenv()

from app.api.endpoints.properties import search_properties

async def test_search():
    try:
        results = await search_properties(query="Hamria", limit=3)
        print(f"Results: {results}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_search())
