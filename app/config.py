import os

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseModel
    class BaseSettings(BaseModel):
        pass

class Settings(BaseSettings):
    hindsight_base_url: str = os.getenv("HINDSIGHT_BASE_URL", "http://127.0.0.1:8888")
    hindsight_bank_id: str = os.getenv("HINDSIGHT_BANK_ID", "negotiation-memory")
    hindsight_api_key: str = os.getenv("HINDSIGHT_API_KEY", "")
    
    server_host: str = os.getenv("HOST", "127.0.0.1")
    server_port: int = int(os.getenv("PORT", "8000"))

settings = Settings()
