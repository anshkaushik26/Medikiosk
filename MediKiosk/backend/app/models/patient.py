"""Patient Profile model."""
import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.user import User
    from backend.app.models.clinical import (
        Condition,
        Medication,
        Allergy,
        FamilyHistory,
        Surgery,
        MedicalDocument,
        TimelineEvent,
        LabResult,
        DocumentExtraction,
    )
    from backend.app.models.interview import (
        ClinicalInterview,
        UrgentInterviewAlert,
    )


class PatientProfile(Base, TimestampMixin):
    __tablename__ = "patient_profiles"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    date_of_birth: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    blood_group: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    emergency_contact: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="patient_profile")
    conditions: Mapped[list["Condition"]] = relationship(
        "Condition", back_populates="patient", cascade="all, delete-orphan"
    )
    medications: Mapped[list["Medication"]] = relationship(
        "Medication", back_populates="patient", cascade="all, delete-orphan"
    )
    allergies: Mapped[list["Allergy"]] = relationship(
        "Allergy", back_populates="patient", cascade="all, delete-orphan"
    )
    family_history: Mapped[list["FamilyHistory"]] = relationship(
        "FamilyHistory", back_populates="patient", cascade="all, delete-orphan"
    )
    surgeries: Mapped[list["Surgery"]] = relationship(
        "Surgery", back_populates="patient", cascade="all, delete-orphan"
    )
    documents: Mapped[list["MedicalDocument"]] = relationship(
        "MedicalDocument", back_populates="patient", cascade="all, delete-orphan"
    )
    lab_results: Mapped[list["LabResult"]] = relationship(
        "LabResult", back_populates="patient", cascade="all, delete-orphan"
    )
    timeline_events: Mapped[list["TimelineEvent"]] = relationship(
        "TimelineEvent", back_populates="patient", cascade="all, delete-orphan"
    )
    interviews: Mapped[list["ClinicalInterview"]] = relationship(
        "ClinicalInterview", back_populates="patient", cascade="all, delete-orphan"
    )
    urgent_alerts: Mapped[list["UrgentInterviewAlert"]] = relationship(
        "UrgentInterviewAlert", back_populates="patient", cascade="all, delete-orphan"
    )
