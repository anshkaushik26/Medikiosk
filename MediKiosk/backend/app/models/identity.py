"""Identity model mapping verified national/standard identifiers."""
import uuid
import enum
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.user import User


class IdentityType(str, enum.Enum):
    ABHA = "ABHA"
    AADHAAR = "AADHAAR"
    MOBILE = "MOBILE"


class Identity(Base, TimestampMixin):
    __tablename__ = "identities"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    identity_type: Mapped[IdentityType] = mapped_column(
        SAEnum(IdentityType), nullable=False, index=True
    )
    identifier_value: Mapped[str] = mapped_column(
        String(128), nullable=False, index=True
    )
    verified_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    user: Mapped["User"] = relationship("User", back_populates="identities")
