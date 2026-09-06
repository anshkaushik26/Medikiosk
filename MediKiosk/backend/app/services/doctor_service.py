"""Doctor service."""
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from backend.app.models.doctor import DoctorProfile
from backend.app.models.user import User, UserRole
from backend.app.models.identity import Identity
from backend.app.models.patient import PatientProfile
from backend.app.schemas.doctor import DoctorProfileCreate, DoctorProfileOut, PatientLookupResponse


def normalize_identifier(val: str) -> str:
    cleaned = val.replace(" ", "").replace("-", "").replace("+91", "").replace("+", "")
    return cleaned.lower()


class DoctorService:
    @staticmethod
    async def get_profile(db: AsyncSession, user_id: str) -> DoctorProfileOut:
        stmt = select(DoctorProfile).where(DoctorProfile.user_id == user_id)
        res = await db.execute(stmt)
        profile = res.scalars().first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor profile not found.",
            )
        return DoctorProfileOut.model_validate(profile)

    @staticmethod
    async def save_profile(db: AsyncSession, user_id: str, data: DoctorProfileCreate) -> DoctorProfileOut:
        stmt = select(DoctorProfile).where(DoctorProfile.user_id == user_id)
        res = await db.execute(stmt)
        profile = res.scalars().first()

        user_stmt = select(User).where(User.id == user_id)
        u_res = await db.execute(user_stmt)
        user = u_res.scalars().first()
        if user and user.role != UserRole.DOCTOR:
            user.role = UserRole.DOCTOR

        if profile:
            profile.full_name = data.full_name
            profile.specialization = data.specialization
            profile.hospital_clinic = data.hospital_clinic
            profile.department = data.department
            profile.registration_number = data.registration_number
            profile.languages_spoken = data.languages_spoken
            profile.years_of_experience = data.years_of_experience
            profile.onboarding_completed = data.onboarding_completed
        else:
            profile = DoctorProfile(
                id=str(uuid.uuid4()),
                user_id=user_id,
                full_name=data.full_name,
                specialization=data.specialization,
                hospital_clinic=data.hospital_clinic,
                department=data.department,
                registration_number=data.registration_number,
                languages_spoken=data.languages_spoken,
                years_of_experience=data.years_of_experience,
                onboarding_completed=data.onboarding_completed,
            )
            db.add(profile)

        await db.commit()
        await db.refresh(profile)
        return DoctorProfileOut.model_validate(profile)

    @staticmethod
    async def lookup_patient_by_identifier(db: AsyncSession, query_identifier: str) -> PatientLookupResponse:
        """Lookup patient strictly via national/standard identifier (ABHA or Mobile). No MediKiosk ID."""
        target_norm = normalize_identifier(query_identifier)
        if not target_norm:
            return PatientLookupResponse(
                found=False,
                patient=None,
                message="Please enter a valid identifier to search.",
            )

        stmt = select(Identity)
        res = await db.execute(stmt)
        all_identities = res.scalars().all()

        matched_identity = None
        for ident in all_identities:
            ident_norm = normalize_identifier(ident.identifier_value)
            if target_norm in ident_norm or ident_norm in target_norm:
                matched_identity = ident
                break

        if not matched_identity:
            return PatientLookupResponse(
                found=False,
                patient=None,
                message=f"No patient found matching '{query_identifier}'. Please verify ABHA or Mobile number.",
            )

        # Retrieve patient profile
        p_stmt = select(PatientProfile).where(PatientProfile.user_id == matched_identity.user_id)
        p_res = await db.execute(p_stmt)
        patient = p_res.scalars().first()

        if patient:
            return PatientLookupResponse(
                found=True,
                patient={
                    "full_name": patient.full_name,
                    "date_of_birth": patient.date_of_birth,
                    "gender": patient.gender,
                    "blood_group": patient.blood_group,
                    "phone_number": patient.phone_number,
                    "address": patient.address,
                    "emergency_contact": patient.emergency_contact,
                    "matched_identity_type": matched_identity.identity_type.value,
                    "matched_identifier": matched_identity.identifier_value,
                    "onboarding_completed": patient.onboarding_completed,
                },
                message="Patient record retrieved via authorized identifier.",
            )

        return PatientLookupResponse(
            found=False,
            patient=None,
            message="Identity verified but no patient profile exists.",
        )
