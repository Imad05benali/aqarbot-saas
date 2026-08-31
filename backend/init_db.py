import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from app.models.models import Base

# Had l-khatt kay-force loading dial .env direct
load_dotenv(override=True)

# Khdem b DIRECT_URL hit hiya dial les migrations/creation f Supabase
DATABASE_URL = os.getenv("DIRECT_URL")

# T-akked nno makaynach +asyncpg f l-lien dial test
if DATABASE_URL and "+asyncpg" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

print(f"🔄 Connecting to: {DATABASE_URL[:45]}...")

try:
    # Khdem b driver psycopg2 li m-instally 3ndna direct
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully in Supabase cloud (public schema)!")
except Exception as e:
    print(f"❌ Error: {e}")