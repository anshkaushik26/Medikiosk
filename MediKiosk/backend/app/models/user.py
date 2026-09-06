"""User model."""
import uuid
import enum
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.identity import Identity
    from backend.app.models.patient import PatientProfile
    from backend.app.models.doctor import DoctorProfile
    from backend.app.models.preferences import UserPreferences


class UserRole(str, enum.Enum):
    PENDING = "PENDING"
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole),
        default=UserRole.PENDING,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    identities: Mapped[List["Identity"]] = relationship(
        "Identity", back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )
    patient_profile: Mapped[Optional["PatientProfile"]] = relationship(
        "PatientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="selectin"
    )
    doctor_profile: Mapped[Optional["DoctorProfile"]] = relationship(
        "DoctorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="selectin"
    )
    preferences: Mapped[Optional["UserPreferences"]] = relationship(
        "UserPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="selectin"
    )
