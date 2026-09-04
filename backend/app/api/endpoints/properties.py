from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import unicodedata
import traceback
import re
from app.core.supabase import supabase  

router = APIRouter()

# Expanded Moroccan Conversational Stop-Words
STOP_WORDS = [
    "bghit", "dar", "chi", "villa", "appart", "appartement", 
    "bghet", "9leb", "lia", "lya", "3la", "l9it", "bghat", "f", "fi",
    "bgha", "m7taj", "n9elleb", "khssni", "khsni", "dyal", "del", 
    "fin", "nl9it", "li", "ma", "kan", "nchouf", "glte", "gol"
]

def normalize_text(text: str) -> str:
    """
    Standardizes input: lowercase and accent decomposition.
    """
    if not text:
        return ""
    nks = unicodedata.normalize('NFD', text)
    clean_text = "".join([c for c in nks if unicodedata.category(c) != 'Mn'])
    return clean_text.lower().strip()

def _fuzzify_token(token: str) -> str:
    """
    FUZZY VOWEL MATCHING:
    Replaces all vowels with the SQL wildcard '%' to handle accent variations.
    Example: 'meknes' -> 'm%kn%s' (Matches 'Meknès')
    """
    # Replace vowels with wildcard
    fuzzed = re.sub(r'[aeiou]', '%', token)
    # Ensure it doesn't end with too many wildcards
    fuzzed = re.sub(r'%+', '%', fuzzed)
    return fuzzed

class PropertyCreate(BaseModel):
    title: str
    description: str
    price: float
    sector: str
    city: str
    agency_id: int

@router.get("/search")
async def search_properties(query: str, limit: int = 5):
    """
    FUZZY NATIONWIDE SEARCH:
    1. Normalizes tokens and applies fuzzy vowel transformation.
    2. Dynamically matches tokens against all location/content columns.
    3. Multi-Pass Fallback ensures recall for complex Darija.
    """
    try:
        if not query:
            return {"status": "success", "results_count": 0, "properties": []}
            
        query_norm = normalize_text(query)
        all_words = re.findall(r'\w+', query_norm)
        
        # High-intent tokens
        tokens = [w for w in all_words if w not in STOP_WORDS and len(w) >= 3]
        
        print(f"--- NATIONWIDE FUZZY SEARCH ATTEMPT: {query} ---")
        print(f"EXTRACTED TOKENS: {tokens}")
        
        # Transform tokens to fuzzy patterns: 'meknes' -> 'm%kn%s'
        fuzzy_tokens = [_fuzzify_token(t) for t in tokens]
        print(f"FUZZIFIED SEARCH PATTERNS: {fuzzy_tokens}")
        
        # PASS 1: Broad Keyword Matching
        results = await _execute_fuzzy_search(fuzzy_tokens, limit)
        
        # PASS 2: Fallback to Priority Token
        if not results and fuzzy_tokens:
            priority_pattern = [fuzzy_tokens[-1]]
            print(f"--- PASS 2 FALLBACK (FUZZY PRIORITY): {priority_pattern} ---")
            results = await _execute_fuzzy_search(priority_pattern, limit)

        return {
            "status": "success",
            "query": query,
            "results_count": len(results),
            "properties": _format_final_results(results)
        }

    except Exception:
        print(f"SEARCH CRITICAL ERROR: {traceback.format_exc()}")
        try:
            fallback_req = supabase.table("morocco_properties").select("*").limit(limit).execute()
            return {
                "status": "fallback",
                "properties": _format_final_results(fallback_req.data)
            }
        except:
             return {"status": "error", "message": "Search unavailable"}

async def _execute_fuzzy_search(fuzzy_tokens: list, limit: int) -> list:
    """Helper to perform Supabase .or_() with fuzzy patterns."""
    if not fuzzy_tokens:
        return []
        
    db_query = supabase.table("morocco_properties").select("*")
    or_conditions = []
    for pattern in fuzzy_tokens:
        or_conditions.append(f"City.ilike.{pattern}")
        or_conditions.append(f"Nighberd.ilike.{pattern}")
        or_conditions.append(f"title.ilike.{pattern}")
        or_conditions.append(f"desc.ilike.{pattern}")
    
    db_query = db_query.or_(",".join(or_conditions))
    supabase_req = db_query.limit(limit).execute()
    return supabase_req.data if supabase_req.data else []

def _format_final_results(results: list) -> list:
    """Ensures consistent data delivery."""
    formatted = []
    for row in results:
        formatted.append({
            "id": row.get("id"),
            "property_id": str(row.get("id")),
            "title": row.get("title"),
            "new_price": row.get("new_price"),
            "Nighberd": row.get("Nighberd"),
            "City": row.get("City"),
            "Type": row.get("Type"),
            # desc holds the per-Type Supabase Storage image URL; prefer a real
            # image_url column when one exists, otherwise fall back to desc.
            "image_url": row.get("image_url") or row.get("desc"),
            "agency": {
                "id": 0,
                "name": "General Listing",
                "email": "support@aqarbot.ma",
                "phone": "N/A"
            }
        })
    return formatted