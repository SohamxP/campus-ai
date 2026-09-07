from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.documents import router as documents_router
from app.api.query import router as query_router

app = FastAPI(
    title="CampusAI AI Service",
    version="0.1.0",
)

app.include_router(health_router)
app.include_router(documents_router)
app.include_router(query_router)


@app.get("/")
def root():
    return {
        "service": "CampusAI AI Service",
        "status": "running",
    }
