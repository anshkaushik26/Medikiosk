"""Authentication API endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user_payload
from backend.app.schemas.auth import (
    OTPRequest, OTPRequestResponse, OTPVerifyRequest,
    AuthTokenResponse, RoleSelectionRequest, UserSessionOut
)
from backend.app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/request-otp", response_model=OTPRequestResponse)
async def request_otp(data: OTPRequest):
    """Initiate mock OTP verification challenge for ABHA, Aadhaar, or Mobile."""
    return await AuthService.request_otp(data)


@router.post("/verify-otp", response_model=AuthTokenResponse)
async def verify_otp(data: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    """Verify challenge response (mock OTP 123456) and return authenticated session."""
    return await AuthService.verify_otp_and_login(db, data)


@router.get("/me", response_model=UserSessionOut)
async def get_me(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Return currently authenticated user session, profiles and preferences."""
    user = await AuthService.get_user_by_id(db, payload["sub"])
    return UserSessionOut.model_validate(user)


@router.post("/role", response_model=UserSessionOut)
async def set_role(
    data: RoleSelectionRequest,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Persist chosen role (PATIENT or DOCTOR) after authentication."""
    return await AuthService.set_role(db, payload["sub"], data.role)


@router.post("/logout")
async def logout():
    """Logout current user."""
    return {"status": "success", "message": "Successfully logged out."}
