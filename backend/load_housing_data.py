"""
Load backend/housing_data.csv into the CURRENT morocco_properties schema.

The table was rebuilt (uuid id, agency_id, title...) so the legacy upload
scripts no longer fit. This loader maps every CSV column explicitly:
  - title / address  <- CSV 'address' (the listing headline)
  - desc             <- CSV 'desc' (per-Type Supabase Storage image URL)
  - chambres / 'salles de bains' as integers, everything else as text

Usage (from backend/):
    py -3 load_housing_data.py [path.csv] [--clear]
"""
import argparse
import csv
import sys

from app.core.supabase import supabase

NUMERIC_TEXT_COLS = ("chambres", "salles de bains")


def _to_int(value):
    if value is None:
        return None
    s = str(value).strip()
    if not s:
        return None
    try:
        return int(float(s))
    except ValueError:
        return None


def _to_str(value):
    if value is None:
        return None
    s = str(value).strip()
    return s or None


def row_to_record(row: dict) -> dict:
    rec = {
        "title": _to_str(row.get("address")),
        "address": _to_str(row.get("address")),
        "desc": _to_str(row.get("desc")),
        "Type": _to_str(row.get("Type")),
        "City": _to_str(row.get("City")),
        "Nighberd": _to_str(row.get("Nighberd")),
        "surface": _to_str(row.get("surface")),
        "ascenseur": _to_str(row.get("ascenseur")),
        "floor": _to_str(row.get("floor")),
        "terrasse": _to_str(row.get("terrasse")),
        "parking": _to_str(row.get("parking")),
        "chambres": _to_int(row.get("chambres")),
        "salles de bains": _to_int(row.get("salles de bains")),
    }

    raw_price = _to_str(row.get("new_price"))
    digits = "".join(c for c in (raw_price or "") if c.isdigit())
    rec["new_price"] = digits or None

    return {k: v for k, v in rec.items() if v is not None}


def main():
    parser = argparse.ArgumentParser(description="Load housing CSV into morocco_properties")
    parser.add_argument("file", nargs="?", default="housing_data.csv", help="CSV path (default: housing_data.csv)")
    parser.add_argument("--clear", action="store_true", help="DELETE all rows from morocco_properties before loading")
    parser.add_argument("--batch", type=int, default=200, help="Rows per insert batch")
    args = parser.parse_args()

    if args.clear:
        res = supabase.table("morocco_properties").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        print(f"Cleared morocco_properties ({len(res.data)} rows deleted).")

    print("Reading CSV...")
    records = []
    with open(args.file, "r", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            rec = row_to_record(row)
            if rec.get("Type") is None and rec.get("City") is None:
                continue
            records.append(rec)

    total = len(records)
    print(f"Total rows parsed: {total}")

    inserted = 0
    for i in range(0, total, args.batch):
        chunk = records[i:i + args.batch]
        try:
            res = supabase.table("morocco_properties").insert(chunk).execute()
            inserted += len(res.data) if res.data else 0
        except Exception as e:
            print(f"BATCH ERROR at row {i}: {e}")
            sys.exit(1)
        print(f"Inserted {inserted} / {total}")
        sys.stdout.flush()

    print(f"Done. {inserted} / {total} rows in morocco_properties.")


if __name__ == "__main__":
    main()
