import os, json
from dotenv import load_dotenv
load_dotenv()
from app.core.supabase import supabase

leads = supabase.table('leads').select('id, agency_id, phone_number, created_at').execute().data
users = supabase.table('users').select('id, full_name').execute().data

# Auth info (from admin api if accessible, or just print users)
print("=== LEADS ===")
for l in leads:
    print(f"Lead ID {l['id'][:8]} | Agency: {str(l.get('agency_id'))[:8]} | Phone: {l.get('phone_number')}")

print("\n=== USERS (PUBLIC TABLE) ===")
for u in users:
    print(f"User ID {u['id'][:8]} | Name: {u['full_name']}")
