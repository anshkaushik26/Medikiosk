"""Patient profile schemas."""
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class PatientProfileCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    onboarding_completed: bool = True


class PatientProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    onboarding_completed: Optional[bool] = None


class PatientProfileOut(BaseModel):
    id: str
    user_id: str
    full_name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    onboarding_completed: bool

    model_config = ConfigDict(from_attributes=True)
