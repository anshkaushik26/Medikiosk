"""Patient API endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user_payload
from backend.app.schemas.patient import PatientProfileCreate, PatientProfileOut
from backend.app.services.patient_service import PatientService

router = APIRouter(prefix="/patient", tags=["Patient"])


@router.get("/profile", response_model=PatientProfileOut)
async def get_patient_profile(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Get profile for authenticated patient."""
    return await PatientService.get_profile(db, payload["sub"])


@router.post("/profile", response_model=PatientProfileOut)
async def save_patient_profile(
    data: PatientProfileCreate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Create or update profile for authenticated patient."""
    return await PatientService.save_profile(db, payload["sub"], data)
