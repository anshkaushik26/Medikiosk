"""Authentication and user session service."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from backend.app.models.user import User, UserRole
from backend.app.models.identity import Identity, IdentityType
from backend.app.models.preferences import UserPreferences
from backend.app.integrations.identity.factory import get_identity_provider
from backend.app.core.security import create_access_token
from backend.app.schemas.auth import (
    OTPRequest, OTPRequestResponse, OTPVerifyRequest,
    AuthTokenResponse, UserSessionOut
)


class AuthService:
    @staticmethod
    async def request_otp(data: OTPRequest) -> OTPRequestResponse:
        adapter = get_identity_provider(data.identity_type)
        challenge = await adapter.initiate_verification(data.identifier)
        return OTPRequestResponse(
            challenge_id=challenge.challenge_id,
            identity_type=challenge.identity_type,
            identifier=challenge.identifier,
            message=challenge.message,
            demo_hint=challenge.demo_hint,
        )

    @staticmethod
    async def verify_otp_and_login(db: AsyncSession, data: OTPVerifyRequest) -> AuthTokenResponse:
        adapter = get_identity_provider(data.identity_type)
        result = await adapter.verify_challenge(data.identifier, data.otp)

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error_message or "OTP verification failed.",
            )

        clean_ident = data.identifier.strip()
        # Find if this identity already belongs to an existing user
        stmt = select(Identity).where(
            Identity.identity_type == data.identity_type,
            Identity.identifier_value == clean_ident,
        )
        res = await db.execute(stmt)
        identity = res.scalars().first()

        user: User
        if identity:
            # User already exists
            user_stmt = select(User).where(User.id == identity.user_id)
            user_res = await db.execute(user_stmt)
            user = user_res.scalars().first()
            identity.verified_at = datetime.now(timezone.utc)
        else:
            # Create new user in PENDING role until they choose Patient or Doctor
            user = User(
                id=str(uuid.uuid4()),
                role=UserRole.PENDING,
                is_active=True,
            )
            db.add(user)
            await db.flush()

            identity = Identity(
                id=str(uuid.uuid4()),
                user_id=user.id,
                identity_type=data.identity_type,
                identifier_value=clean_ident,
                verified_at=datetime.now(timezone.utc),
            )
            db.add(identity)

            # Create default preferences
            pref = UserPreferences(
                id=str(uuid.uuid4()),
                user_id=user.id,
                language="en",
                text_size="normal",
                high_contrast=False,
                voice_enabled=False,
            )
            db.add(pref)

        await db.commit()

        # Load fresh user data
        full_user = await AuthService.get_user_by_id(db, user.id)
        token = create_access_token(subject=user.id, role=user.role.value)

        return AuthTokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserSessionOut.model_validate(full_user),
        )

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: str) -> User:
        stmt = select(User).where(User.id == user_id)
        res = await db.execute(stmt)
        user = res.scalars().first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )
        return user

    @staticmethod
    async def set_role(db: AsyncSession, user_id: str, role: UserRole) -> UserSessionOut:
        user = await AuthService.get_user_by_id(db, user_id)
        user.role = role
        await db.commit()
        refreshed = await AuthService.get_user_by_id(db, user_id)
        return UserSessionOut.model_validate(refreshed)
