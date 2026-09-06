"""
pexels_service.py - dynamic property-photo sourcing from the Pexels API.

Used at RUNTIME by the backend: when a property row in morocco_properties has
no usable image (missing / empty `desc`), callers ask this service for a
high-resolution, landscape-cropped photo URL matching the property's profile
(type + city). The URL is then persisted in `desc` (caller's job) so the
WhatsApp bot and the dashboard always have an image to show.

The API key is NEVER stored in code - it is read from PEXELS_API_KEY (also
accepts PEXELS_KEY) in the environment / backend/.env. When the key is absent
every method degrades gracefully (empty results / None) so the rest of the
pipeline keeps working with whatever images already exist.

Search results are cached in-memory per query (30 minutes) and rotated, so
consecutive rows of the same type/city receive DIFFERENT photos without
re-hitting the API every time (free tier: ~200 requests/hour).
"""
import logging
import os
import time
from urllib.parse import urlsplit, urlunsplit

import requests

logger = logging.getLogger(__name__)

_PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search"
_CACHE_TTL_S = 30 * 60
_DEFAULT_PER_PAGE = 8

# In-memory cache: query -> list of photo dicts; query -> fetched timestamp;
# query -> rotation cursor (next index to hand out).
_PHOTOS_CACHE = {}
_PHOTOS_TS = {}
_PHOTOS_CURSOR = {}
_WARNED_NO_KEY = False

# Keyword base per property Type, so Darija/French type names in the DB map
# to searchable real-estate photo keywords.
TYPE_QUERIES = {
    "appartement": "modern apartment building exterior",
    "studio": "studio apartment interior",
    "villa": "luxury villa exterior",
    "bureau": "modern office building",
    "plateau": "modern office building",
    "bureau / plateau": "modern office building",
    "magasin": "retail storefront shop",
    "local commercial": "retail storefront shop",
    "terrain": "land plot real estate",
    "maison": "modern house exterior",
    "riad": "moroccan riad courtyard",
    "duplex": "modern duplex house exterior",
    "loft": "loft apartment interior",
    "chalet": "modern chalet house",
}
DEFAULT_TYPE_QUERY = "real estate property"

# City names that are safe to append to a Pexels query.
_STOP_CITY = {"n/a", "unknown", "autre", "other", "non specifie", "non sp\u00e9cifi\u00e9", "", "none", "null"}


class PexelsService:
    # ------------------------------------------------------------------ API
    @staticmethod
    def _api_key() -> str:
        global _WARNED_NO_KEY
        key = os.getenv("PEXELS_API_KEY") or os.getenv("PEXELS_KEY") or ""
        if not key and not _WARNED_NO_KEY:
            logger.warning("PEXELS_API_KEY is not set - dynamic photo enrichment is disabled.")
            _WARNED_NO_KEY = True
        return key

    @staticmethod
    def search_photos(query: str, per_page: int = _DEFAULT_PER_PAGE,
                      orientation: str = "landscape") -> list:
        """Return raw Pexels photo dicts for a query (cached for 30 min)."""
        if not query or not PexelsService._api_key():
            return []

        now = time.time()
        cached = _PHOTOS_CACHE.get(query)
        if cached and now - _PHOTOS_TS.get(query, 0) < _CACHE_TTL_S:
            return list(cached)

        try:
            resp = requests.get(
                _PEXELS_SEARCH_URL,
                headers={"Authorization": PexelsService._api_key()},
                params={
                    "query": query,
                    "per_page": per_page,
                    "orientation": orientation,
                },
                timeout=20,
            )
            resp.raise_for_status()
            photos = resp.json().get("photos", [])
            _PHOTOS_CACHE[query] = list(photos)
            _PHOTOS_TS[query] = now
            _PHOTOS_CURSOR.setdefault(query, 0)
            logger.info("Pexels: cached %d photo(s) for %r", len(photos), query)
            return list(photos)
        except Exception as e:
            logger.error(f"Pexels search failed for {query!r}: {e}")
            # Keep serving whatever we had cached even past the TTL on errors.
            return list(_PHOTOS_CACHE.get(query, []))

    # ------------------------------------------------------------- URL magic
    @staticmethod
    def resized_url(photo: dict, width: int = 1600, height: int = 1200) -> str:
        """
        High-resolution landscape-cropped URL for a photo.

        Pexels image CDNs accept dynamic resize params, so we always return a
        reasonably sized crop (good for WhatsApp + web) instead of the raw
        multi-megabyte original.
        """
        if not photo:
            return ""
        src = photo.get("src") or {}
        base = (src.get("original") or src.get("large2x") or src.get("large") or "").strip()
        if not base.startswith("http"):
            return ""
        # Strip any query Pexels already attached and apply our own resize:
        # a clean w/h/fit crop on the images.pexels.com CDN.
        parts = urlsplit(base)
        clean = urlunsplit((parts.scheme, parts.netloc, parts.path, "", ""))
        return f"{clean}?auto=compress&cs=tinysrgb&w={width}&h={height}&fit=crop"

    @staticmethod
    def search_photo_urls(query: str, count: int = 4) -> list:
        """High-resolution URLs for a query (helper exposed for callers/tests)."""
        photos = PexelsService.search_photos(query, per_page=max(count, _DEFAULT_PER_PAGE))
        urls = [PexelsService.resized_url(p) for p in photos]
        return [u for u in urls if u][:count]

    @staticmethod
    def next_photo_url(query: str) -> str:
        """
        Rotating single URL for a query: consecutive calls for the same query
        return different photos, so same-city properties do not all show the
        exact same image.
        """
        if not query:
            return ""
        photos = PexelsService.search_photos(query)
        if not photos:
            return ""
        idx = _PHOTOS_CURSOR.get(query, 0) % len(photos)
        _PHOTOS_CURSOR[query] = idx + 1
        return PexelsService.resized_url(photos[idx])

    # ------------------------------------------------------- property helpers
    @staticmethod
    def query_for_property(prop: dict) -> str:
        """
        Build a Pexels search query from a morocco_properties row / formatted
        result. Examples: 'luxury villa exterior marrakech',
        'modern apartment building exterior casablanca'.
        """
        ptype = str(prop.get("Type") or "").strip().lower()
        base = TYPE_QUERIES.get(ptype, TYPE_QUERIES.get(ptype.split(" / ")[0], DEFAULT_TYPE_QUERY))
        city = str(prop.get("City") or "").strip().lower()
        if city in _STOP_CITY:
            city = ""
        parts = [base]
        if city:
            parts.append(city)
        return " ".join(parts)

    @staticmethod
    def url_for_property(prop: dict) -> str:
        """One rotating high-res photo URL for a property row ('' if none)."""
        return PexelsService.next_photo_url(PexelsService.query_for_property(prop))
