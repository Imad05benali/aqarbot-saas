import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv('DIRECT_URL'))

with engine.begin() as conn:
    # Build conversations table
    conn.execute(text("""
    CREATE TABLE IF NOT EXISTS conversations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        agency_id UUID,
        phone TEXT,
        message TEXT,
        sender TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );
    """))
    print("Created conversations table")
    
    # RLS Policies
    conn.execute(text("ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;"))
    conn.execute(text("DROP POLICY IF EXISTS \"agency_auth_select\" ON conversations;"))
    conn.execute(text("DROP POLICY IF EXISTS \"agency_auth_insert\" ON conversations;"))
    conn.execute(text("CREATE POLICY \"agency_auth_select\" ON conversations FOR SELECT TO authenticated USING (auth.uid()::text = agency_id::text);"))
    conn.execute(text("CREATE POLICY \"agency_auth_insert\" ON conversations FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = agency_id::text);"))
    print("Conversations table secured!")
