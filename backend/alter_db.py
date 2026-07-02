# coding: utf-8
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv('DIRECT_URL'))

with engine.begin() as conn:
    queries = [
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone_number TEXT;",
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS name TEXT;",
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS full_name TEXT;",
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT;",
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_ai_paused BOOLEAN DEFAULT FALSE;",
        'ALTER TABLE leads ADD COLUMN IF NOT EXISTS "City" TEXT;',
        'ALTER TABLE leads ADD COLUMN IF NOT EXISTS "Nighberd" TEXT;',
        'ALTER TABLE leads ADD COLUMN IF NOT EXISTS "Type" TEXT;',
        "ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone TEXT;"
    ]
    for q in queries:
        conn.execute(text(q))
    print("Columns added successfully!")
