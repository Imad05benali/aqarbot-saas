import os
import time
from supabase import create_client, Client

# 1. Initialisation d Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase environment variables (URL or SERVICE_ROLE_KEY).")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def process_incoming_lead_and_log(phone_number: str, raw_text: str, darija_intent: str, tokens: int, start_time: float):
    """
    Pipeline s s7i7 to handle incoming WhatsApp messages, parse intent, 
    and log telemetry directly into the standardized 'leads' table.
    """
    latency = time.time() - start_time
    
    try:
        # Standardized on the 'leads' table for all prospect data and telemetry
        lead_data = {
            "phone_number": phone_number,
            "darija_intent": darija_intent,
            "last_message": raw_text,
            "latency_ms": int(latency * 1000),
            "tokens_used": tokens,
            "status": "ACTIVE"
        }
        
        supabase.table("leads").upsert(
            lead_data, on_conflict="phone_number"
        ).execute()
        
        print(f"📊 [Database Standardized]: Lead {phone_number} synchronized in primary leads table.")
        
    except Exception as e:
        print(f"❌ [Database Error]: Couldn't sync lead telemetry: {str(e)}")

# --- REFACTORED STRICT SEARCH LOGIC ---
async def get_matching_properties(query_text: str, limit: int = 4):
    """
    Principal-level search logic to fix the City vs Sector matching bug.
    Strictly prioritizes entire city results for single-city queries.
    """
    try:
        import re
        # 1. Normalization
        clean_text = query_text.strip().lower()
        words = re.findall(r'\w+', clean_text)
        
        # Moroccan Stop-words (minimal for this layer)
        stop_words = ["bghit", "chi", "dar", "villa", "appart", "3la", "f", "fi", "dyal", "li"]
        keywords = [w for w in words if w not in stop_words and len(w) > 2]
        if not keywords: keywords = words
        
        # 2. ROBUST CITY DETECTION
        detected_city = None
        city_keyword = None
        is_fallback = False
        
        for kw in keywords:
            clean_kw = kw.strip().lower()
            # Fuzzy match: Handles 'casablanca' matching 'Casablanca ' or 'Casablanca'
            city_check = supabase.table("morocco_properties").select("City").ilike("City", f"%{clean_kw}%").limit(1).execute()
            if city_check.data:
                detected_city = city_check.data[0]["City"]
                city_keyword = kw
                break
        
        # 3. PROCEDURAL FILTERING WITH FALLBACK
        res_data = []
        if detected_city:
            clean_city = detected_city.strip().lower()
            # CASE A: Only one word or only city name was mentioned
            if len(words) <= 2 or not [k for k in keywords if k != city_keyword]:
                res = supabase.table("morocco_properties").select("*").ilike("City", f"%{clean_city}%").limit(limit).execute()
                res_data = res.data
            else:
                # CASE B: City + specific Sector/Details
                other_keywords = [k for k in keywords if k != city_keyword]
                query = supabase.table("morocco_properties").select("*").ilike("City", f"%{clean_city}%")
                
                or_conditions = []
                for okw in other_keywords:
                    clean_okw = okw.strip().lower()
                    fuzzy_pattern = f"%{clean_okw}%"
                    or_conditions.append(f"Nighberd.ilike.{fuzzy_pattern}")
                    or_conditions.append(f"title.ilike.{fuzzy_pattern}")
                    or_conditions.append(f"Type.ilike.{fuzzy_pattern}")
                
                res = query.or_(",".join(or_conditions)).limit(limit).execute()
                res_data = res.data
                
                # FALLBACK: If City + Keywords failed, just show anything in that city
                if not res_data:
                    is_fallback = True
                    print(f"⚠️ [Search Fallback]: No matches for {other_keywords} in {detected_city}. Showing popular.")
                    fallback_res = supabase.table("morocco_properties").select("*").ilike("City", f"%{clean_city}%").limit(limit).execute()
                    res_data = fallback_res.data
        else:
            # CASE C: No city detected, perform broad fuzzy search (Nationwide)
            or_conditions = []
            for kw in keywords:
                clean_kw = kw.strip().lower()
                fuzzy_pattern = f"%{clean_kw}%"
                or_conditions.append(f"City.ilike.{fuzzy_pattern}")
                or_conditions.append(f"Nighberd.ilike.{fuzzy_pattern}")
                or_conditions.append(f"title.ilike.{fuzzy_pattern}")
                or_conditions.append(f"Type.ilike.{fuzzy_pattern}")
            
            res = supabase.table("morocco_properties").select("*").or_(",".join(or_conditions)).limit(limit).execute()
            res_data = res.data

        # 4. Results Formatting
        formatted = []
        for row in res_data:
            formatted.append({
                "id": row.get("id"),
                "title": row.get("title"),
                "new_price": row.get("new_price"),
                "Nighberd": row.get("Nighberd"),
                "City": row.get("City"),
                "Type": row.get("Type"),
                "agency": {"name": "AqarBot Listing", "phone": "N/A"}
            })
        
        return {"results": formatted, "is_fallback": is_fallback}

    except Exception as e:
        print(f"⚠️ [Strict Search Error]: {str(e)}")
        return {"results": [], "is_fallback": False}