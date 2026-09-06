"""Doctor API endpoints."""
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user_payload
from backend.app.schemas.doctor import DoctorProfileCreate, DoctorProfileOut, PatientLookupResponse
from backend.app.services.doctor_service import DoctorService

router = APIRouter(prefix="/doctor", tags=["Doctor"])


class PatientSearchRequest(BaseModel):
    identifier: str


@router.get("/profile", response_model=DoctorProfileOut)
async def get_doctor_profile(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Get profile for authenticated doctor."""
    return await DoctorService.get_profile(db, payload["sub"])


@router.post("/profile", response_model=DoctorProfileOut)
async def save_doctor_profile(
    data: DoctorProfileCreate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Create or update profile for authenticated doctor."""
    return await DoctorService.save_profile(db, payload["sub"], data)


@router.post("/patients/search", response_model=PatientLookupResponse)
async def search_patient(
    data: PatientSearchRequest,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Lookup patient record by ABHA or Mobile Number (no MediKiosk ID)."""
    return await DoctorService.lookup_patient_by_identifier(db, data.identifier)
