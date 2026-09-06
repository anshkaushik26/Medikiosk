"""User preferences schemas."""
from typing import Optional
from pydantic import BaseModel, ConfigDict


class UserPreferencesUpdate(BaseModel):
    language: Optional[str] = None
    text_size: Optional[str] = None
    high_contrast: Optional[bool] = None
    voice_enabled: Optional[bool] = None


class UserPreferencesOut(BaseModel):
    id: str
    user_id: str
    language: str
    text_size: str
    high_contrast: bool
    voice_enabled: bool

    model_config = ConfigDict(from_attributes=True)
