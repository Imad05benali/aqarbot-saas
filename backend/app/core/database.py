from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Create async engine for Supabase/PostgreSQL
# pgbouncer=true in the connection string handles the pooling on Supabase side
engine = create_async_engine(
    settings.async_database_url,
    echo=False,  # Set to True for debugging SQL queries
    pool_pre_ping=True,
)

# Async session factory
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
class Base(DeclarativeBase):
    pass

# Dependency to get DB session
async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
