import os
import json
import traceback
from app.core.supabase import supabase

class LeadService:
    @staticmethod
    def create_lead(client_phone: str, client_name: str, property_id: str = None) -> bool:
        """
        THE UNBREAKABLE INSERTION BYPASS:
        Tries full insertion into 'leads' table with schema-aligned columns (name, phone).
        If it fails, it tries the bare minimum.
        """
        print(f"\n--- DATABASE INSERTION ATTEMPT FOR: {client_name} ({client_phone}) ---")
        
        # Clean inputs
        phone_clean = str(client_phone).strip()
        name_clean = str(client_name).strip()
        
        # 1. Get a valid agency_id (required by schema)
        # In a real scenario, this should come from context, but we fallback to first agency
        agency_id = None
        try:
            agencies_resp = supabase.table("users").select("id").order("created_at", desc=True).limit(1).execute()
            if agencies_resp.data:
                agency_id = agencies_resp.data[0]["id"]
                print(f"DB DEBUG: Using Agency ID: {agency_id}")
            else:
                print("WARNING: No agency found in 'agencies' table. Insertion may fail.")
        except Exception as e:
            print(f"ERROR fetching agency: {str(e)}")

        # Attempt 1: Full structure mapping payload (aligned with SQLAlchemy model)
        try:
            data = {
                "name": name_clean,
                "phone_number": phone_clean,
                "agency_id": agency_id,
                "city": "Inconnu",
                # Column names from models.py: name, phone_number, agency_id, budget, sector, status
            }
            
            print(f"DB DEBUG: Pushing payload to 'leads' -> {json.dumps(data)}")
            response = supabase.table("leads").insert(data).execute()
            
            if response.data:
                print(f"SUCCESS: Lead registered in Supabase!")
                return True
                
        except Exception as e:
            print(f"FIRST ATTEMPT VIOLATION: {str(e)}")

        # Attempt 2: Minimal fallback (if needed)
        # Note: agency_id is usually a required FK, so we still include it
        print("FALLBACK: Retrying insertion...")
        try:
            fallback_data = {
                "name": name_clean,
                "phone_number": phone_clean,
                "agency_id": agency_id,
                "city": "Inconnu"
            }
            response_fallback = supabase.table("leads").insert(fallback_data).execute()
            
            if response_fallback.data:
                print(f"SUCCESS VIA FALLBACK: Lead registered safely!")
                return True
                
        except Exception as fallback_error:
            print(f"CRITICAL BOTH PATHWAYS CRASHED. SUPABASE REJECTION ERROR DETAILED:")
            print(traceback.format_exc())
            return False

    @staticmethod
    def check_lead_exists(client_phone: str) -> bool:
        """
        Checks if a lead with the given phone already exists.
        Aligned with the 'phone' column in 'leads' table.
        """
        try:
            response = supabase.table("leads").select("*").eq("phone_number", str(client_phone).strip()).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"EXCEPTION while checking lead existence: {str(e)}")
            return False