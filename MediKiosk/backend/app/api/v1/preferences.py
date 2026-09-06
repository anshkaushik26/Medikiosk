"""Preferences API endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.core.security import get_current_user_payload
from backend.app.models.preferences import UserPreferences
from backend.app.schemas.preferences import UserPreferencesUpdate, UserPreferencesOut

router = APIRouter(prefix="/preferences", tags=["Preferences"])


@router.get("", response_model=UserPreferencesOut)
async def get_preferences(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Get user preferences (language, text size, voice)."""
    stmt = select(UserPreferences).where(UserPreferences.user_id == payload["sub"])
    res = await db.execute(stmt)
    pref = res.scalars().first()
    if not pref:
        pref = UserPreferences(user_id=payload["sub"])
        db.add(pref)
        await db.commit()
        await db.refresh(pref)
    return UserPreferencesOut.model_validate(pref)


@router.put("", response_model=UserPreferencesOut)
async def update_preferences(
    data: UserPreferencesUpdate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Update user preferences."""
    stmt = select(UserPreferences).where(UserPreferences.user_id == payload["sub"])
    res = await db.execute(stmt)
    pref = res.scalars().first()
    if not pref:
        pref = UserPreferences(user_id=payload["sub"])
        db.add(pref)

    if data.language is not None:
        pref.language = data.language
    if data.text_size is not None:
        pref.text_size = data.text_size
    if data.high_contrast is not None:
        pref.high_contrast = data.high_contrast
    if data.voice_enabled is not None:
        pref.voice_enabled = data.voice_enabled

    await db.commit()
    await db.refresh(pref)
    return UserPreferencesOut.model_validate(pref)
