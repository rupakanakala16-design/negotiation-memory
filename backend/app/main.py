import logging
from pathlib import Path
from typing import Dict, Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.core.config import settings
from backend.app.api.api_router import api_router
from app.hindsight_service import hindsight_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_title,
    description=settings.app_description,
    version=settings.app_version
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_router)

@app.get("/health")
@app.get("/api/health")
def health_check() -> Dict[str, Any]:
    """System health check and Hindsight connectivity status."""
    hindsight_status = hindsight_service.check_health()
    all_deals = hindsight_service.get_all_negotiations()
    return {
        "status": "healthy",
        "service": settings.app_title,
        "version": settings.app_version,
        "hindsight": hindsight_status,
        "memory_bank": {
            "bank_id": settings.hindsight_bank_id,
            "stored_experiences_count": len(all_deals),
            "suppliers_indexed": list(set(d.supplier for d in all_deals))
        }
    }

# Mount frontend directory for browser UI
frontend_path = Path(__file__).parent.parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_path)), name="static")

@app.get("/")
def serve_index():
    index_file = frontend_path / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "Negotiation Memory API is running."}
