import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv('DIRECT_URL'))

with engine.begin() as conn:
    # First drop if exists just in case
    conn.execute(text("DROP POLICY IF EXISTS \"agency_isolation_policy_select\" ON leads;"))
    conn.execute(text("DROP POLICY IF EXISTS \"agency_isolation_policy_insert\" ON leads;"))
    conn.execute(text("DROP POLICY IF EXISTS \"agency_isolation_policy_update\" ON leads;"))
    
    # Enable and create policies
    conn.execute(text("ALTER TABLE leads ENABLE ROW LEVEL SECURITY;"))
    conn.execute(text("CREATE POLICY \"agency_isolation_policy_select\" ON leads FOR SELECT TO authenticated USING (auth.uid()::text = agency_id::text);"))
    conn.execute(text("CREATE POLICY \"agency_isolation_policy_insert\" ON leads FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = agency_id::text);"))
    conn.execute(text("CREATE POLICY \"agency_isolation_policy_update\" ON leads FOR UPDATE TO authenticated USING (auth.uid()::text = agency_id::text);"))
    
    # Also allow service role to do anything (by default bypassrls, but just in case)
    print("Policies applied!")
