import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    app_title: str = "Negotiation Memory - Institutional Intelligence API"
    app_version: str = "1.0.0"
    app_description: str = "FastAPI Intelligence Backend for Institutional Procurement Memory & Strategy Guidance"

    # Hindsight Configuration
    hindsight_base_url: str = os.getenv("HINDSIGHT_BASE_URL", "http://127.0.0.1:8888")
    hindsight_bank_id: str = os.getenv("HINDSIGHT_BANK_ID", "negotiation-memory")
    hindsight_api_key: str = os.getenv("HINDSIGHT_API_KEY", "")
    hindsight_llm_provider: str = os.getenv("HINDSIGHT_API_LLM_PROVIDER", "none")
    hindsight_llm_model: str = os.getenv("HINDSIGHT_API_LLM_MODEL", "llama-3.3-70b-versatile")

    # Server
    host: str = os.getenv("HOST", "127.0.0.1")
    port: int = int(os.getenv("PORT", "8000"))


settings = Settings()

