from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
from dotenv import load_dotenv

load_dotenv(override=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "AqarBot"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "yoursecretkeyhere"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # Database
    DATABASE_URL: str
    DIRECT_URL: Optional[str] = None
    
    # Supabase Client
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str

    # Google Gemini
    GOOGLE_API_KEY: str = "your_google_api_key_here"

    # Vector Store
    PINECONE_API_KEY: Optional[str] = None
    PINECONE_ENVIRONMENT: Optional[str] = None
    PINECONE_INDEX_NAME: str = "aqarbot-properties"

    # Meta Hook
    META_VERIFY_TOKEN: str = "your_meta_verify_token_here"
    META_ACCESS_TOKEN: str = "your_meta_access_token_here"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    def _make_async(self, url: str) -> str:
        if not url:
            return url
        # Strip pgbouncer param if present, as asyncpg doesn't like it in the URL string
        if "?pgbouncer=true" in url:
            url = url.replace("?pgbouncer=true", "")
        
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    @property
    def async_database_url(self) -> str:
        return self._make_async(self.DATABASE_URL)

    @property
    def async_direct_url(self) -> str:
        return self._make_async(self.DIRECT_URL or self.DATABASE_URL)

settings = Settings()
