import os
from dotenv import load_dotenv
load_dotenv(dotenv_path='../frontend/.env') # Load frontend anon key
from supabase import create_client

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

print(f"URL: {SUPABASE_URL}")
try:
    client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    response = client.table('leads').select('*').limit(5).execute()
    print(f"ANON KEY RESPONSE: {response.data}")
except Exception as e:
    print(f"ANON KEY ERROR: {e}")
