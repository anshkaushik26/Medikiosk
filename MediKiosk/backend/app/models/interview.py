"""Interview data models for MediKiosk Phase 4: Adaptive AI Health Interview."""
import uuid
from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.patient import PatientProfile


class ClinicalInterview(Base, TimestampMixin):
    __tablename__ = "clinical_interviews"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    patient_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    branch: Mapped[str] = mapped_column(String(50), default="GENERAL", nullable=False)
    current_question_id: Mapped[str] = mapped_column(String(100), default="START", nullable=False)
    status: Mapped[str] = mapped_column(
        String(30), default="IN_PROGRESS", nullable=False
    )  # IN_PROGRESS, REVIEW, CONFIRMED, ABANDONED, URGENT
    safety_status: Mapped[str] = mapped_column(
        String(30), default="NORMAL", nullable=False
    )  # NORMAL, ELEVATED, URGENT_RED_FLAG
    chief_complaint: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    summary: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="interviews")
    answers: Mapped[List["InterviewAnswer"]] = relationship(
        "InterviewAnswer", back_populates="interview", cascade="all, delete-orphan", order_by="InterviewAnswer.created_at"
    )
    alerts: Mapped[List["UrgentInterviewAlert"]] = relationship(
        "UrgentInterviewAlert", back_populates="interview", cascade="all, delete-orphan"
    )


class InterviewAnswer(Base, TimestampMixin):
    __tablename__ = "interview_answers"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    interview_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("clinical_interviews.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    normalized_value: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    answer_type: Mapped[str] = mapped_column(String(50), default="CHOICE", nullable=False)
    source: Mapped[str] = mapped_column(String(30), default="TOUCH", nullable=False)  # VOICE, TEXT, TOUCH, RECORD, DOCUMENT

    interview: Mapped["ClinicalInterview"] = relationship("ClinicalInterview", back_populates="answers")


class UrgentInterviewAlert(Base, TimestampMixin):
    __tablename__ = "urgent_interview_alerts"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    patient_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    interview_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("clinical_interviews.id", ondelete="CASCADE"), nullable=False, index=True
    )
    triggered_rule: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(
        String(30), default="NEW", nullable=False
    )  # NEW, ACKNOWLEDGED, RESOLVED

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="urgent_alerts")
    interview: Mapped["ClinicalInterview"] = relationship("ClinicalInterview", back_populates="alerts")
