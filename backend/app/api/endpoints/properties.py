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


# ----------------------------------------------------------------------------
#  STRUCTURED SMART SEARCH (Type / City / Nighberd / budget)
#  Used by the WhatsApp pipeline when Gemini emits a ready_to_search action.
#  The catalog stores accents that were mangled at import time (e.g. the city
#  column literally contains 'Mekn\ufffds' / 'F\ufffds', sectors like
#  'Belv\ufffdd\ufffdre'), so after a cheap DB filter (Type) the remaining
#  text matching happens in Python on a CONSONANT SKELETON that is immune to
#  lost accents and vowel spelling variants ('meknes' == 'Mekn\ufffds').
# ----------------------------------------------------------------------------

# Conversational / Darija / Arabic keyword -> canonical property family.
TYPE_ALIASES = {
    # French / Darija (latin)
    "appartement": "Appartement", "appart": "Appartement", "apart": "Appartement",
    "appt": "Appartement", "ch9a": "Appartement", "chqa": "Appartement",
    "studio": "Studio", "stud": "Studio", "studi": "Studio",
    "villa": "Villa", "vilas": "Villa", "dar": "Villa",
    "bureau": "Bureau", "bureaux": "Bureau", "office": "Bureau",
    "plateau": "Bureau", "plateaux": "Bureau",
    "magasin": "Magasin", "boutique": "Magasin", "local": "Magasin",
    "mahal": "Magasin", "commerce": "Magasin",
    "terrain": "Terrain", "land": "Terrain", "ard": "Terrain",
    "maison": "Maison", "riad": "Riad", "duplex": "Duplex",
    "loft": "Loft", "chalet": "Chalet",
    # Arabic
    "\u0634\u0642\u0629": "Appartement", "\u0634\u0642\u0647": "Appartement",
    "\u0641\u064a\u0644\u0627": "Villa", "\u0641\u064a\u0644\u0629": "Villa",
    "\u0633\u062a\u0648\u062f\u064a\u0648": "Studio",
    "\u0627\u0633\u062a\u0648\u062f\u064a\u0648": "Studio",
    "\u0645\u0643\u062a\u0628": "Bureau", "\u0645\u062d\u0644": "Magasin",
    "\u0623\u0631\u0636": "Terrain", "\u0627\u0631\u0636": "Terrain",
    "\u062f\u0627\u0631": "Maison", "\u0631\u064a\u0627\u0636": "Riad",
}

# Canonical DB spellings each family may live under (a future dataset may
# combine 'Bureau / Plateau' in a single Type value).
TYPE_DB_NAMES = {
    "Appartement": ["Appartement"],
    "Studio": ["Studio"],
    "Villa": ["Villa"],
    "Bureau": ["Bureau", "Bureau / Plateau"],
    "Magasin": ["Magasin", "Local commercial"],
    "Terrain": ["Terrain"],
    "Maison": ["Maison"],
    "Riad": ["Riad"],
    "Duplex": ["Duplex"],
    "Loft": ["Loft"],
    "Chalet": ["Chalet"],
}

# Spoken/city-name variants -> canonical city label used for matching & display.
CITY_ALIASES = {
    "casablanca": "Casablanca", "casa": "Casablanca", "casablanca city": "Casablanca",
    "dar al beida": "Casablanca", "dar el beida": "Casablanca", "dk": "Casablanca",
    "marrakech": "Marrakech", "marrakesh": "Marrakech",
    "meknes": "Meknes", "mekn\u00e8s": "Meknes", "miknas": "Meknes",
    "fes": "Fes", "f\u00e8s": "Fes", "fas": "Fes",
    "tanger": "Tanger", "tangier": "Tanger", "tanja": "Tanger", "tanga": "Tanger",
    "mohammedia": "Mohammadia", "mohammadia": "Mohammadia", "mohammadia": "Mohammadia",
    "dar bouazza": "Dar Bouazza", "dar bouazza": "Dar Bouazza",
    "rabat": "Rabat", "agadir": "Agadir", "kenitra": "Kenitra", "oujda": "Oujda",
    "tetouan": "Tetouan", "t\u00e9touan": "Tetouan", "safi": "Safi", "el jadida": "El Jadida",
}

# Pretty labels for display, with real accents restored when the stored value
# was mangled at import time.
CITY_DISPLAY = {
    "Casablanca": "Casablanca", "Marrakech": "Marrakech", "Meknes": "Mekn\u00e8s",
    "Fes": "F\u00e8s", "Tanger": "Tanger", "Mohammadia": "Mohammadia",
    "Dar Bouazza": "Dar Bouazza", "Rabat": "Rabat", "Agadir": "Agadir",
    "Kenitra": "Kenitra", "Oujda": "Oujda", "Tetouan": "Tetouan",
    "Safi": "Safi", "El Jadida": "El Jadida",
}

# Rental intent keywords (used to tell the client the catalog is sale-only).
RENTAL_KEYWORDS = ("location", "louer", "loc", "rent", "rental", "lease", "\u0643\u0631\u0627\u0621", "\u0643\u0631\u0627")


def _norm_letters(value) -> str:
    """Lowercase, strip diacritics and every non a-z0-9 char (keeps numbers)."""
    if value is None:
        return ""
    nks = unicodedata.normalize("NFD", str(value))
    flat = "".join(c for c in nks if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "", flat.lower())


def _cons_key(value) -> str:
    """Consonant skeleton: letters minus vowels/digits. Two spellings of the
    same word that only differ in vowels/accents share the same skeleton
    ('meknes' == 'Mekn\ufffds' == 'mekn\u00e8s' -> 'mkns')."""
    return re.sub(r"[aeiouy0-9]+", "", _norm_letters(value))


def _parse_price(value):
    """Parse a price value that may be int, float, '1000000' or '1,200,000' -> int or None."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return int(value)
    digits = re.sub(r"\D", "", str(value))
    return int(digits) if digits else None


def _budget_matches(price: int, max_budget) -> bool:
    if max_budget in (None, "", 0, "0"):
        return True
    budget = _parse_price(max_budget)
    if budget is None:
        return True
    return price is not None and price <= budget


def resolve_city_key(city) -> str:
    """Return the canonical city label matching a free-text city, or None."""
    if not city:
        return None
    raw = str(city).strip().lower()
    direct = CITY_ALIASES.get(raw)
    if direct:
        return direct
    # e.g. 'casa blanca' spacing / double space variants
    raw_flat = re.sub(r"\s+", " ", raw)
    direct = CITY_ALIASES.get(raw_flat)
    if direct:
        return direct
    # Consonant comparison against every known city label.
    needle = _cons_key(raw)
    if not needle:
        return None
    for label in CITY_ALIASES.values():
        if _cons_key(label) == needle:
            return label
    return None


def _row_city_matches(row_city: str, city_key: str) -> bool:
    """True when the stored (possibly mangled) city matches the canonical key."""
    if not city_key:
        return True
    return _cons_key(row_city) == _cons_key(city_key)


def _row_sector_matches(row_sector: str, sector_text: str) -> bool:
    """True when the stored sector matches free-text sector keywords."""
    if not sector_text:
        return True
    needle = _cons_key(sector_text)
    if not needle:
        return True
    hay = _cons_key(row_sector)
    return bool(hay and (needle in hay or hay in needle))


def _clean_row_price(row) -> int:
    return _parse_price(row.get("new_price"))


def _format_smart_row(row) -> dict:
    """Rich row shape for the WhatsApp caption builder (keeps the legacy keys
    used by the fuzzy search so both outputs are interchangeable)."""
    price = _clean_row_price(row)
    return {
        "id": row.get("id"),
        "property_id": str(row.get("id")),
        "title": row.get("title"),
        "new_price": str(price) if price is not None else row.get("new_price"),
        "price_text": f"{price:,} DH" if price is not None else None,
        "Type": row.get("Type"),
        "City": row.get("City"),
        "Nighberd": row.get("Nighberd"),
        "surface": row.get("surface"),
        "chambres": row.get("chambres"),
        "salles_de_bains": row.get("salles de bains"),
        "floor": row.get("floor"),
        "parking": row.get("parking"),
        "terrasse": row.get("terrasse"),
        "ascenseur": row.get("ascenseur"),
        "desc": row.get("desc"),
        # desc is the Supabase Storage image URL for this property.
        "image_url": row.get("image_url") or row.get("desc"),
        "agency": {
            "id": 0,
            "name": "General Listing",
            "email": "support@aqarbot.ma",
            "phone": "N/A"
        }
    }


def _dedupe_rows(rows: list) -> list:
    seen = set()
    out = []
    for r in rows:
        key = (
            _norm_letters(r.get("title")),
            _cons_key(r.get("City")),
            _cons_key(r.get("Nighberd")),
            str(_clean_row_price(r) if _clean_row_price(r) is not None else ""),
            _norm_letters(r.get("surface")),
            str(r.get("chambres") or ""),
        )
        if key in seen:
            continue
        seen.add(key)
        out.append(r)
    return out


async def search_matching_properties(city=None, property_type=None, neighborhood=None,
                                     max_budget=None, operation=None, limit: int = 3) -> list:
    """
    STRUCTURED SMART SEARCH against the real columns of morocco_properties
    ("Type", "City", "Nighberd", "new_price", "desc").

    - Type is filtered in SQL via the canonical DB spellings.
    - City / sector are matched in Python on consonant skeletons, so requests
      like 'meknes', 'mekn\u00e8s' or 'casablanca' hit rows whose stored text was
      mangled at import time ('Mekn\ufffds').
    - max_budget is enforced numerically on new_price (stored as text digits).
    - Returns at most `limit` deduplicated, formatted properties (image_url
      included), cheapest first. Empty list when nothing matches.
    """
    try:
        family = TYPE_ALIASES.get(str(property_type or "").strip().lower())
        db_types = TYPE_DB_NAMES.get(family) if family else None

        # PostgREST caps a single page at 1000 rows, so iterate pages when the
        # type family is larger (e.g. 2244 Appartements) - otherwise rows past
        # the first 1000 (Tanger, Dar Bouazza...) would silently never match.
        rows = []
        try:
            _step = 1000
            _start = 0
            while True:
                query = supabase.table("morocco_properties").select("*")
                if db_types:
                    query = query.in_("Type", db_types)
                query = query.range(_start, _start + _step - 1)
                page = (query.execute().data) or []
                rows.extend(page)
                if len(page) < _step:
                    break
                _start += _step
                if _start > 20000:
                    break
        except Exception as e:
            print(f"[SmartSearch] DB filter failed ({e}); falling back to single-page scan.")
            res = supabase.table("morocco_properties").select("*").limit(1000).execute()
            rows = res.data or []

        city_key = resolve_city_key(city)
        sector_text = str(neighborhood or "").strip()
        rent_requested = bool(operation) and str(operation).strip().lower() in RENTAL_KEYWORDS

        # Sector phrases that must match the stored Nighberd. When the client
        # gave a neighborhood but the LLM put it in the `city` slot, treat it
        # as a sector phrase too (it is not a known city, so city_key is None).
        sector_phrases = [sector_text] if sector_text else []
        if city and not city_key:
            sector_phrases.append(str(city).strip())
        sector_phrases = [p for p in sector_phrases if p]

        def _sector_ok(row_sector) -> bool:
            if not sector_phrases:
                return True
            hay = _cons_key(row_sector)
            if not hay:
                return False
            return any((lambda n: n in hay or hay in n)(_cons_key(p)) for p in sector_phrases)

        scored = []
        for row in rows:
            row_city = str(row.get("City") or "")
            city_ok = (not city_key) or _row_city_matches(row_city, city_key)
            if not city_ok:
                continue
            if not _sector_ok(row.get("Nighberd")):
                continue
            price = _clean_row_price(row)
            if not _budget_matches(price, max_budget):
                continue
            scored.append((price if price is not None else float("inf"), row))

        scored.sort(key=lambda item: (item[0], _cons_key(item[1].get("Nighberd") or "")))
        ranked = [row for _, row in scored]
        ranked = _dedupe_rows(ranked)[:limit]

        formatted = [_format_smart_row(r) for r in ranked]
        if formatted:
            print(f"[SmartSearch] {len(formatted)} match(es) for "
                  f"type={property_type!r} city={city_key!r} sector={sector_text!r} "
                  f"budget={max_budget!r} rent={rent_requested}")
        return formatted
    except Exception as e:
        import traceback as _tb
        print(f"[SmartSearch] CRITICAL ERROR: {_tb.format_exc()}")
        return []