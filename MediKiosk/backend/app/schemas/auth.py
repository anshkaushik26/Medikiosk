"""Authentication schemas."""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from backend.app.models.user import UserRole
from backend.app.models.identity import IdentityType


class OTPRequest(BaseModel):
    identity_type: IdentityType
    identifier: str = Field(..., min_length=4, max_length=120)


class OTPRequestResponse(BaseModel):
    challenge_id: str
    identity_type: str
    identifier: str
    message: str
    demo_hint: Optional[str] = None


class OTPVerifyRequest(BaseModel):
    identity_type: IdentityType
    identifier: str = Field(..., min_length=4, max_length=120)
    otp: str = Field(..., min_length=4, max_length=10)


class RoleSelectionRequest(BaseModel):
    role: UserRole


class IdentityOut(BaseModel):
    id: str
    identity_type: IdentityType
    identifier_value: str
    verified_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PatientProfileBrief(BaseModel):
    id: str
    full_name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    blood_group: Optional[str] = None
    onboarding_completed: bool

    model_config = ConfigDict(from_attributes=True)


class DoctorProfileBrief(BaseModel):
    id: str
    full_name: str
    specialization: str
    hospital_clinic: Optional[str] = None
    department: Optional[str] = None
    years_of_experience: Optional[int] = 0
    onboarding_completed: bool

    model_config = ConfigDict(from_attributes=True)


class UserPreferencesBrief(BaseModel):
    language: str = "en"
    text_size: str = "normal"
    high_contrast: bool = False
    voice_enabled: bool = False

    model_config = ConfigDict(from_attributes=True)


class UserSessionOut(BaseModel):
    id: str
    role: UserRole
    is_active: bool
    identities: List[IdentityOut] = []
    patient_profile: Optional[PatientProfileBrief] = None
    doctor_profile: Optional[DoctorProfileBrief] = None
    preferences: Optional[UserPreferencesBrief] = None

    model_config = ConfigDict(from_attributes=True)


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserSessionOut
