"""Patient service."""
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from backend.app.models.patient import PatientProfile
from backend.app.models.user import User, UserRole
from backend.app.schemas.patient import PatientProfileCreate, PatientProfileUpdate, PatientProfileOut


class PatientService:
    @staticmethod
    async def get_profile(db: AsyncSession, user_id: str) -> PatientProfileOut:
        stmt = select(PatientProfile).where(PatientProfile.user_id == user_id)
        res = await db.execute(stmt)
        profile = res.scalars().first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found.",
            )
        return PatientProfileOut.model_validate(profile)

    @staticmethod
    async def save_profile(db: AsyncSession, user_id: str, data: PatientProfileCreate) -> PatientProfileOut:
        stmt = select(PatientProfile).where(PatientProfile.user_id == user_id)
        res = await db.execute(stmt)
        profile = res.scalars().first()

        # Also ensure user role is PATIENT
        user_stmt = select(User).where(User.id == user_id)
        u_res = await db.execute(user_stmt)
        user = u_res.scalars().first()
        if user and user.role != UserRole.PATIENT:
            user.role = UserRole.PATIENT

        if profile:
            profile.full_name = data.full_name
            profile.date_of_birth = data.date_of_birth
            profile.gender = data.gender
            profile.phone_number = data.phone_number
            profile.address = data.address
            profile.blood_group = data.blood_group
            profile.emergency_contact = data.emergency_contact
            profile.onboarding_completed = data.onboarding_completed
        else:
            profile = PatientProfile(
                id=str(uuid.uuid4()),
                user_id=user_id,
                full_name=data.full_name,
                date_of_birth=data.date_of_birth,
                gender=data.gender,
                phone_number=data.phone_number,
                address=data.address,
                blood_group=data.blood_group,
                emergency_contact=data.emergency_contact,
                onboarding_completed=data.onboarding_completed,
            )
            db.add(profile)

        await db.commit()
        await db.refresh(profile)
        return PatientProfileOut.model_validate(profile)
