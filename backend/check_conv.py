import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv('DIRECT_URL'))

with engine.begin() as conn:
    res = conn.execute(text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations');")).fetchone()
    print("Conversations exists:", res[0])
