from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.courses import router as courses_router
from app.api.documents import router as documents_router
from app.api.health import router as health_router
from app.api.query import router as query_router
from app.api.study import router as study_router
from app.core_config import settings

app = FastAPI(
    title="CampusAI AI Service",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        settings.frontend_url,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(courses_router)
app.include_router(documents_router)
app.include_router(query_router)
app.include_router(study_router)


@app.get("/")
def root():
    return {
        "service": "CampusAI AI Service",
        "version": "0.3.0",
        "status": "running",
    }
