# coding: utf-8
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv('DIRECT_URL'))

with engine.begin() as conn:
    print([r[0] for r in conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='leads';")).fetchall()])
