"""Main MediKiosk FastAPI Application Entrypoint."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.core.database import engine, async_session_factory
from backend.app.models.base import Base
# Import all models to register with Base.metadata
from backend.app.models.user import User
from backend.app.models.identity import Identity
from backend.app.models.patient import PatientProfile
from backend.app.models.doctor import DoctorProfile
from backend.app.models.preferences import UserPreferences
from backend.app.models.clinical import (
    Condition,
    Medication,
    Allergy,
    FamilyHistory,
    Surgery,
    MedicalDocument,
    TimelineEvent,
    LabResult,
    DocumentExtraction,
    ExtractedEntity,
)
from backend.app.models.interview import (
    ClinicalInterview,
    InterviewAnswer,
    UrgentInterviewAlert,
)
from backend.app.services.seed_service import seed_demo_data

# Routers
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.patient import router as patient_router
from backend.app.api.v1.clinical import router as clinical_router
from backend.app.api.v1.document_intelligence import router as doc_intel_router
from backend.app.api.v1.interview import router as interview_router
from backend.app.api.v1.doctor import router as doctor_router
from backend.app.api.v1.preferences import router as pref_router
from backend.app.api.v1.dev import router as dev_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifespan context."""
    # 1. Initialize tables if using SQLite local development fallback
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # 2. Seed initial demo data
    async with async_session_factory() as session:
        await seed_demo_data(session)
    
    yield
    
    # Teardown database connections on shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="MediKiosk Backend API - Accessible Digital Healthcare Platform for India",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for local Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(patient_router, prefix=settings.API_V1_STR)
app.include_router(clinical_router, prefix=settings.API_V1_STR)
app.include_router(doc_intel_router, prefix=settings.API_V1_STR)
app.include_router(interview_router, prefix=settings.API_V1_STR)
app.include_router(doctor_router, prefix=settings.API_V1_STR)
app.include_router(pref_router, prefix=settings.API_V1_STR)
app.include_router(dev_router, prefix=settings.API_V1_STR)


@app.get("/")
async def health_check():
    """Root health check endpoint."""
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "tagline": "Make healthcare information simple before the consultation begins."
    }
