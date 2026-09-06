"""
load_pexels_images.py - one-time enrichment of morocco_properties images.

Fetches real, varied property photos from the Pexels API, uploads them into the
existing public `property_images` Supabase Storage bucket (named by Pexels photo
id, e.g. property_villa_30165027.jpg), then backfills each morocco_properties
row's `desc` with a photo URL from its Type's pool (cycled so listings in the
same city do not all show the identical picture).

The WhatsApp bot already reads the image URL from `desc`, so once this runs the
bot's image messages - and the dashboard - show real-looking property photos.
The original 3 generic images (appartement.jpg / villa.jpg / 'bereau ,plateau .jpeg')
stay in the bucket untouched; to roll back, restore those per-Type URLs.

No API key is stored in this file. Environment comes from backend/.env:
  PEXELS_API_KEY                 (required)
  SUPABASE_URL                   (required - has a sensible default in app.core.supabase)
  SUPABASE_SERVICE_ROLE_KEY      (required)
  DATABASE_URL                   (optional - when present, the desc backfill runs
                                  as ONE batched UPDATE instead of per-row REST calls)

Usage (from backend/):
  py -3 load_pexels_images.py                  # full run
  py -3 load_pexels_images.py --dry-run        # fetch + upload photos only; no DB writes
  py -3 load_pexels_images.py --per-type 6     # smaller photo pool per Type
  py -3 load_pexels_images.py --only-types Villa,Bureau
"""
import argparse
import sys
import time

import requests
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env", override=True)
import os

from app.core.supabase import supabase, SUPABASE_URL

BUCKET = "property_images"
PUBLIC_BASE = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}"

# Multiple searches per Type keep the pool visually varied (different queries
# return different photographers/buildings). Generic real-estate keywords are
# intentionally used - these photos are indicative, not the exact listing.
SEARCH_QUERIES = {
    "Appartement": [
        "modern apartment building",
        "residential building facade",
        "apartment interior living room",
        "appartement moderne salon",
    ],
    "Studio": [
        "studio apartment interior",
        "small studio flat interior",
        "studio apartment design",
    ],
    "Villa": [
        "luxury villa exterior",
        "villa with swimming pool",
        "modern villa architecture marrakech",
        "luxury home exterior",
    ],
    "Bureau": [
        "modern office interior",
        "modern office building",
        "open space bureau moderne",
    ],
}

UA = "AqarBot/1.0 (property image enrichment)"


def _pexels_headers():
    key = os.getenv("PEXELS_API_KEY")
    if not key:
        print("ERROR: PEXELS_API_KEY is missing (add it to backend/.env).")
        sys.exit(1)
    return {"Authorization": key, "User-Agent": UA}


def fetch_pool_images(pexels_type: str, wanted: int) -> list:
    """Return up to `wanted` distinct photo dicts for a Type."""
    photos = []
    seen = set()
    h = _pexels_headers()
    for query in SEARCH_QUERIES.get(pexels_type, []):
        if len(photos) >= wanted:
            break
        try:
            r = requests.get(
                "https://api.pexels.com/v1/search",
                headers=h,
                params={"query": query, "per_page": 15, "orientation": "landscape"},
                timeout=30,
            )
            r.raise_for_status()
        except Exception as e:
            print(f"  [warn] Pexels search {query!r} failed: {e}")
            continue
        for p in r.json().get("photos", []):
            pid = p.get("id")
            src = (p.get("src") or {}).get("large")
            if not pid or not src or pid in seen:
                continue
            seen.add(pid)
            photos.append({"id": pid, "url": src, "by": p.get("photographer", "")})
            if len(photos) >= wanted:
                break
        time.sleep(0.3)
    return photos


def _existing_objects() -> set:
    """Names already present in the bucket (so re-runs skip re-uploading)."""
    try:
        r = requests.post(
            f"{SUPABASE_URL}/storage/v1/object/list/{BUCKET}",
            headers={"apikey": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
                     "Authorization": f"Bearer {os.getenv('SUPABASE_SERVICE_ROLE_KEY')}",
                     "Content-Type": "application/json"},
            json={"prefix": "", "limit": 1000, "offset": 0},
            timeout=20,
        )
        if r.status_code == 200:
            return {o.get("name") for o in r.json()}
    except Exception as e:
        print(f"  [warn] Could not list bucket objects: {e}")
    return set()


def upload_photo(name: str, image_bytes: bytes) -> str:
    """
    Upload bytes to the public bucket and return its public URL.

    Raw HTTP is used on purpose: the stored Content-Type must be image/jpeg
    (the storage SDK stored text/plain here), otherwise browsers and the
    WhatsApp Media API see the link as non-image.
    """
    svc = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    res = requests.post(
        f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{name}",
        headers={
            "apikey": svc,
            "Authorization": f"Bearer {svc}",
            "Content-Type": "image/jpeg",
            "x-upsert": "true",
            "Cache-Control": "public, max-age=3600",
        },
        data=image_bytes,
        timeout=60,
    )
    res.raise_for_status()
    return f"{PUBLIC_BASE}/{name}"


def ensure_photos(pexels_type: str, wanted: int, existing: set) -> list:
    """Return public URLs for the pool of this Type (uploading when missing)."""
    name_for = lambda p: f"property_{pexels_type.lower()}_{p['id']}.jpg"
    urls = []
    for p in fetch_pool_images(pexels_type, wanted):
        name = name_for(p)
        if name in existing:
            urls.append(f"{PUBLIC_BASE}/{name}")
            continue
        try:
            dl = requests.get(p["url"], headers={"User-Agent": UA}, timeout=60)
            dl.raise_for_status()
        except Exception as e:
            print(f"  [warn] download failed for {p['url']}: {e}")
            continue
        try:
            url = upload_photo(name, dl.content)
            existing.add(name)
            urls.append(url)
            print(f"  uploaded {name} ({len(dl.content) // 1024} KB)")
        except Exception as e:
            print(f"  [warn] upload failed for {name}: {e}")
            continue
    return urls


def fetch_ids_for_type(pexels_type: str) -> list:
    """All morocco_properties row ids of a Type (paginated past 1000)."""
    ids = []
    start, step = 0, 1000
    while True:
        page = (supabase.table("morocco_properties").select("id")
                .eq("Type", pexels_type).range(start, start + step - 1)
                .execute().data) or []
        ids.extend(r["id"] for r in page)
        if len(page) < step:
            break
        start += step
    return ids


def fetch_distinct_types() -> list:
    """Distinct Type values currently in morocco_properties."""
    types = set()
    start, step = 0, 1000
    while True:
        page = (supabase.table("morocco_properties").select("Type")
                .range(start, start + step - 1).execute().data) or []
        types.update(str(r.get("Type")) for r in page if r.get("Type"))
        if len(page) < step:
            break
        start += step
    return sorted(types)


def build_mapping(pools: dict) -> dict:
    """id -> photo URL, cycling each Type's pool across its rows."""
    mapping = {}
    for pexels_type, urls in pools.items():
        ids = fetch_ids_for_type(pexels_type)
        for i, rid in enumerate(ids):
            mapping[rid] = urls[i % len(urls)]
    return mapping


def _usable_db_urls() -> list:
    """Return connection-string candidates psycopg2 can parse.

    Supabase pooler URLs ship with `pgbouncer=true` (and sometimes
    connection_limit) query params that psycopg2 rejects outright - strip
    those. If the host is the pooler, also offer the direct postgres host
    (db.<ref>.supabase.co:5432) as a second candidate.
    """
    from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

    raw = os.getenv("DATABASE_URL")
    if not raw:
        return []
    parts = urlsplit(raw)
    keep = [(k, v) for k, v in parse_qsl(parts.query)
            if k.lower() not in ("pgbouncer", "connection_limit", "options")]
    clean = urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(keep), parts.fragment))
    candidates = [clean]
    host = (parts.hostname or "").lower()
    # The pooler host does not carry the project ref; take it from SUPABASE_URL
    # (https://<ref>.supabase.co) and offer the direct db.<ref>.supabase.co:5432
    # endpoint as a second candidate.
    sb_host = (os.getenv("SUPABASE_URL") or "").split("//", 1)[-1].split("/", 1)[0]
    ref = sb_host.split(".", 1)[0] if ".supabase.co" in sb_host else ""
    if ref and "pooler" in host and "supabase.co" in host:
        direct_host = f"db.{ref}.supabase.co"
        direct = urlunsplit((parts.scheme, f"{direct_host}:5432", parts.path, urlencode(keep), parts.fragment))
        candidates.append(direct)
    seen, out = set(), []
    for c in candidates:
        if c not in seen:
            seen.add(c)
            out.append(c)
    return out


def backfill_via_sql(mapping: dict) -> int:
    """One batched UPDATE via a direct/clean Postgres connection."""
    import psycopg2
    from psycopg2.extras import execute_values

    last_err = None
    for dsn in _usable_db_urls():
        try:
            conn = psycopg2.connect(dsn, connect_timeout=15)
            try:
                cur = conn.cursor()
                pairs = [(str(rid), url) for rid, url in mapping.items()]
                execute_values(
                    cur,
                    'UPDATE morocco_properties mp SET "desc" = v.url '
                    'FROM (VALUES %s) AS v(id, url) WHERE mp.id::text = v.id::text',
                    pairs,
                    template="(%s, %s)",
                    page_size=500,
                )
                conn.commit()
                return cur.rowcount
            finally:
                conn.close()
        except Exception as e:
            last_err = e
            print(f"  [warn] psycopg2 connect/update failed on {dsn.split('@')[-1].split('?')[0]}: {e}")
    print(f"  [error] no SQL connection worked ({last_err}); will fall back to REST updates.")
    return -1


def backfill_via_rest(mapping: dict) -> int:
    """Per-row REST updates (fallback when no DATABASE_URL)."""
    done = 0
    for i, (rid, url) in enumerate(mapping.items(), 1):
        supabase.table("morocco_properties").update({"desc": url}).eq("id", rid).execute()
        done += 1
        if i % 200 == 0:
            print(f"  updated {i} / {len(mapping)}")
            sys.stdout.flush()
    return done


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
    parser = argparse.ArgumentParser(description="Enrich morocco_properties with Pexels photos")
    parser.add_argument("--dry-run", action="store_true", help="fetch/upload photos but do NOT touch the DB")
    parser.add_argument("--per-type", type=int, default=8, help="photo pool size per Type (default 8)")
    parser.add_argument("--only-types", default="", help="comma-separated subset, e.g. Villa,Bureau")
    args = parser.parse_args()

    wanted = max(3, min(args.per_type, 12))
    only = {t.strip() for t in args.only_types.split(",") if t.strip()}

    present = fetch_distinct_types()
    print(f"Types present in DB: {present}")

    pools = {}
    existing = _existing_objects()
    for pexels_type, queries in SEARCH_QUERIES.items():
        if pexels_type not in present:
            print(f"Skipping {pexels_type}: no rows in DB.")
            continue
        if only and pexels_type not in only:
            continue
        print(f"[{pexels_type}] searching Pexels for up to {wanted} photos...")
        pool = ensure_photos(pexels_type, wanted, existing)
        if not pool:
            print(f"  [error] no photos obtained for {pexels_type}; aborting.")
            sys.exit(1)
        pools[pexels_type] = pool
        print(f"  pool ready: {len(pool)} image(s)")

    if not pools:
        print("Nothing to do - no matching Type present (choose --only-types from the list above).")
        sys.exit(1)

    mapping = build_mapping(pools)
    print(f"Mapping built for {len(mapping)} property rows.")

    if args.dry_run:
        print("DRY RUN - no DB writes performed.")
        for pexels_type, urls in pools.items():
            print(f"  {pexels_type} ({len(urls)} urls):")
            for u in urls:
                print("    ", u)
        return

    if os.getenv("DATABASE_URL"):
        updated = backfill_via_sql(mapping)
        if updated < 0:
            print("Falling back to per-row REST updates (slower)...")
            updated = backfill_via_rest(mapping)
    else:
        print("DATABASE_URL not set - using per-row REST updates (slower).")
        updated = backfill_via_rest(mapping)
    print(f"Done. desc updated on {updated} / {len(mapping)} rows.")

    # Sample readback so the change is visible immediately.
    for pexels_type in pools:
        row = (supabase.table("morocco_properties").select("id,Type,City,desc")
               .eq("Type", pexels_type).limit(2).execute().data or [])
        for r in row:
            print(f"  sample {r['Type']} {r['City']}: {r.get('desc')}")

    print("\nRollback: restore per-Type generics "
          "(appartement.jpg / villa.jpg / 'bereau ,plateau .jpeg') with one UPDATE.")


if __name__ == "__main__":
    main()
