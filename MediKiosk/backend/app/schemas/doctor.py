"""Doctor profile schemas."""
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class DoctorProfileCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    specialization: str = Field(..., min_length=2, max_length=120)
    hospital_clinic: Optional[str] = None
    department: Optional[str] = None
    registration_number: Optional[str] = None
    languages_spoken: Optional[str] = None
    years_of_experience: Optional[int] = 0
    onboarding_completed: bool = True


class DoctorProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    specialization: Optional[str] = None
    hospital_clinic: Optional[str] = None
    department: Optional[str] = None
    registration_number: Optional[str] = None
    languages_spoken: Optional[str] = None
    years_of_experience: Optional[int] = None
    onboarding_completed: Optional[bool] = None


class DoctorProfileOut(BaseModel):
    id: str
    user_id: str
    full_name: str
    specialization: str
    hospital_clinic: Optional[str] = None
    department: Optional[str] = None
    registration_number: Optional[str] = None
    languages_spoken: Optional[str] = None
    years_of_experience: Optional[int] = 0
    onboarding_completed: bool

    model_config = ConfigDict(from_attributes=True)


class PatientLookupResponse(BaseModel):
    found: bool
    patient: Optional[dict] = None
    message: str
