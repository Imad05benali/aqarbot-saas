import os
import sys
import json
from dotenv import load_dotenv

# Add the backend directory to sys.path
sys.path.append(os.getcwd())

from app.core.supabase import supabase

load_dotenv(override=True)

def audit_database():
    print("--- SUPABASE PROPERTIES AUDIT ---")
    try:
        req = supabase.table("properties").select("*, agencies(*)").execute()
        data = req.data
        print(f"Total Properties Found: {len(data)}")
        for i, row in enumerate(data):
            agency = row.get("agencies", {})
            agency_name = agency.get("name") if isinstance(agency, dict) else "N/A"
            print(f"{i+1}. Title: {row.get('title')} | City: {row.get('city')} | Agency: {agency_name}")
    except Exception as e:
        print(f"Audit Failed: {str(e)}")

if __name__ == "__main__":
    audit_database()
