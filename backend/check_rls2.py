import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv('DIRECT_URL'))

with engine.begin() as conn:
    print(conn.execute(text("SELECT policyname, qual, with_check FROM pg_policies WHERE tablename='leads';")).fetchall())
