import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv('DIRECT_URL'))

with engine.begin() as conn:
    print(conn.execute(text("SELECT relrowsecurity FROM pg_class WHERE relname='conversations';")).fetchone())
    print(conn.execute(text("SELECT policyname FROM pg_policies WHERE tablename='conversations';")).fetchall())
