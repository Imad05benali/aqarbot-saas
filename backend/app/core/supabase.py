import os
from supabase import create_client, Client, ClientOptions
from dotenv import load_dotenv

load_dotenv(override=True)

SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://lvplxnfcuofvffbnurye.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2cGx4bmZjdW9mdmZmYm51cnllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ5ODgwMCwiZXhwIjoyMDk2MDc0ODAwfQ.-m_zWWKej3LFe6SK6QEB_aPvqYbn84Wj9LsCPkFi-gs"

# performance & safety options
options = ClientOptions(
    persist_session=False,
    postgrest_client_timeout=30,
    storage_client_timeout=30
)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, options=options)