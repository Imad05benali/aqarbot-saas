import os
import json
import traceback
from app.core.supabase import supabase

class LeadService:
    @staticmethod
    def create_lead(client_phone: str, client_name: str, property_id: str = None, city: str = "Inconnu", sector: str = None, budget: str = None, agency_id: str = None) -> bool:
        """
        MULTI-TENANT LEAD INSERTION:
        Requires an explicit agency_id parameter for strict tenant binding.
        Falls back to resolving from the users table ONLY if not provided.
        """
        print(f"\n--- DATABASE INSERTION ATTEMPT FOR: {client_name} ({client_phone}) ---")
        
        # Clean inputs
        phone_clean = str(client_phone).strip()
        name_clean = str(client_name).strip()
        
        # 1. Resolve agency_id if not explicitly provided
        if not agency_id:
            try:
                # First: check if this phone already has a lead with an agency
                existing = supabase.table("leads").select("agency_id").eq("phone_number", phone_clean).limit(1).execute()
                if existing.data and existing.data[0].get("agency_id"):
                    agency_id = existing.data[0]["agency_id"]
                    print(f"DB DEBUG: Reusing existing agency_id from lead record: {agency_id}")
                else:
                    # Fallback: most recently registered agency (strict rebuilt schema:
                    # agency_name lives on 'agencies', users link to it via agency_id)
                    agencies_resp = supabase.table("agencies").select("id, agency_name").order("created_at", desc=True).limit(1).execute()
                    if agencies_resp.data:
                        agency_id = agencies_resp.data[0]["id"]
                        agency_name = agencies_resp.data[0].get("agency_name")
                        print(f"DB DEBUG: Fallback Agency ID: {agency_id} | Agency Name: {agency_name}")
                    else:
                        print("WARNING: No agency found in 'agencies' table. Insertion may fail.")
            except Exception as e:
                print(f"ERROR fetching agency: {str(e)}")
        else:
            print(f"DB DEBUG: Using explicitly provided agency_id: {agency_id}")

        # Strict rebuilt leads schema: id, agency_id, phone_number, full_name,
        # city, sector, status, is_ai_paused (budget/name columns no longer exist)
        try:
            data = {
                "full_name": name_clean,
                "phone_number": phone_clean,
                "agency_id": agency_id,
                "city": city,
                "sector": sector,
                "status": "new",
            }
            # Remove None values to avoid inserting nulls for optional fields
            data = {k: v for k, v in data.items() if v is not None}

            print(f"DB DEBUG: Pushing payload to 'leads' -> {json.dumps(data)}")
            response = supabase.table("leads").insert(data).execute()

            if response.data:
                print(f"SUCCESS: Lead registered in Supabase! (City={city}, Sector={sector}, Agency={agency_id})")
                return True

        except Exception as e:
            print(f"FIRST ATTEMPT VIOLATION: {str(e)}")

        # Attempt 2: Minimal fallback
        print("FALLBACK: Retrying insertion...")
        try:
            fallback_data = {
                "full_name": name_clean,
                "phone_number": phone_clean,
                "agency_id": agency_id,
                "city": city or "Inconnu",
                "status": "new",
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
    def check_lead_exists(client_phone: str, agency_id: str = None) -> bool:
        """
        Checks if a lead with the given phone already exists.
        Optionally scoped by agency_id for strict multi-tenancy.
        """
        try:
            query = supabase.table("leads").select("*").eq("phone_number", str(client_phone).strip())
            if agency_id:
                query = query.eq("agency_id", agency_id)
            response = query.execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"EXCEPTION while checking lead existence: {str(e)}")
            return False