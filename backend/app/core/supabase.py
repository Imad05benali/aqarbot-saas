import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

load_dotenv(override=True)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("Missing Supabase environment variables (URL or SERVICE_ROLE_KEY).")

# performance & safety options
options = ClientOptions(
    persist_session=False,
    postgrest_client_timeout=30,
    storage_client_timeout=30
)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, options=options)