import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

load_dotenv(override=True)

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://lvplxnfcuofvffbnurye.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY is missing from .env")

# Fix for infinite hang with 'sb_' keys: Disable session persistence
options = ClientOptions(
    persist_session=False,
    postgrest_client_timeout=30,
    storage_client_timeout=30
)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY, options=options)