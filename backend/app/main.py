import os
from dotenv import load_dotenv

# 1. Force loading dial .env s7i7 right at the beginning
load_dotenv(override=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import properties, whatsapp

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(properties.router, prefix="/api/properties", tags=["Properties"])
app.include_router(whatsapp.router, prefix="/api/whatsapp", tags=["WhatsApp"])

@app.get("/")
async def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} backend!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)