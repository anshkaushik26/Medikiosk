"""Clinical data models for MediKiosk Phase 2 & Phase 3: Patient Health Record + Document Intelligence."""
import uuid
from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, Float, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.patient import PatientProfile


class Condition(Base, TimestampMixin):
    __tablename__ = "patient_conditions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    patient_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    condition_name: Mapped[str] = mapped_column(String(150), nullable=False)
    diagnosis_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="Active", nullable=False)
    doctor_hospital: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_document_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="conditions")


class Medication(Base, TimestampMixin):
    __tablename__ = "patient_medications"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    patient_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    medicine_name: Mapped[str] = mapped_column(String(150), nullable=False)
    dose: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    frequency: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    route: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    start_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    end_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    prescribed_by: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    purpose: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="Currently taking", nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_document_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="medications")


class Allergy(Base, TimestampMixin):
    __tablename__ = "patient_allergies"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    patient_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    allergen: Mapped[str] = mapped_column(String(150), nullable=False)
    reaction: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    severity: Mapped[str] = mapped_column(String(30), default="Moderate", nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_document_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="allergies")


class FamilyHistory(Base, TimestampMixin):
    __tablename__ = "patient_family_history"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    patient_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    relation: Mapped[str] = mapped_column(String(50), nullable=False)
    condition: Mapped[str] = mapped_column(String(150), nullable=False)
    age_at_diagnosis: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="family_history")


class Surgery(Base, TimestampMixin):
    __tablename__ = "patient_surgeries"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    patient_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    procedure_name: Mapped[str] = mapped_column(String(200), nullable=False)
    surgery_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    hospital: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    doctor: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_document_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="surgeries")


class LabResult(Base, TimestampMixin):
    __tablename__ = "patient_lab_results"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    patient_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    document_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("patient_documents.id", ondelete="SET NULL"), nullable=True, index=True
    )
    test_name: Mapped[str] = mapped_column(String(150), nullable=False)
    value: Mapped[str] = mapped_column(String(80), nullable=False)
    unit: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    reference_range: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="WITHIN_RANGE", nullable=False)  # WITHIN_RANGE, ABOVE_RANGE, BELOW_RANGE, UNKNOWN
    test_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    source_page: Mapped[Optional[int]] = mapped_column(Integer, default=1, nullable=True)
    source_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    verification_status: Mapped[str] = mapped_column(String(50), default="PATIENT_VERIFIED", nullable=False)
    doctor_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    doctor_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="lab_results")
    document: Mapped[Optional["MedicalDocument"]] = relationship("MedicalDocument", back_populates="lab_results")


class MedicalDocument(Base, TimestampMixin):
    __tablename__ = "patient_documents"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    patient_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    document_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(255), nullable=False)
    file_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mime_type: Mapped[str] = mapped_column(String(100), default="application/pdf", nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    document_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    hospital_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    doctor_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    patient_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    verification_status: Mapped[str] = mapped_column(String(50), default="Patient added", nullable=False)

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="documents")
    lab_results: Mapped[List["LabResult"]] = relationship("LabResult", back_populates="document", cascade="all, delete-orphan")
    extraction: Mapped[Optional["DocumentExtraction"]] = relationship("DocumentExtraction", back_populates="document", uselist=False, cascade="all, delete-orphan")


class DocumentExtraction(Base, TimestampMixin):
    __tablename__ = "document_extractions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    document_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("patient_documents.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    patient_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    extraction_status: Mapped[str] = mapped_column(
        String(50), default="QUEUED", nullable=False
    )  # QUEUED, PROCESSING, EXTRACTED, NEEDS_REVIEW, PATIENT_VERIFIED, REJECTED, FAILED
    current_step: Mapped[str] = mapped_column(
        String(100), default="Uploading document", nullable=False
    )
    ocr_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    detected_language: Mapped[str] = mapped_column(String(20), default="en", nullable=False)
    ocr_confidence: Mapped[float] = mapped_column(Float, default=0.95, nullable=False)
    structured_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    processing_provider: Mapped[str] = mapped_column(String(100), default="MockOCRProvider", nullable=False)
    quality_issues: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    document: Mapped["MedicalDocument"] = relationship("MedicalDocument", back_populates="extraction")
    entities: Mapped[List["ExtractedEntity"]] = relationship("ExtractedEntity", back_populates="extraction", cascade="all, delete-orphan")


class ExtractedEntity(Base, TimestampMixin):
    __tablename__ = "document_extracted_entities"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    document_extraction_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("document_extractions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    entity_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # MEDICATION, LAB_RESULT, CONDITION, ALLERGY, SURGERY, DOCTOR_NAME, HOSPITAL_NAME, DOCUMENT_DATE
    entity_value: Mapped[dict] = mapped_column(JSON, nullable=False)
    normalized_value: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.95, nullable=False)
    page_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    source_text: Mapped[str] = mapped_column(Text, default="", nullable=False)
    bounding_box: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)  # {x, y, width, height} in percentages
    verification_status: Mapped[str] = mapped_column(
        String(50), default="NEEDS_REVIEW", nullable=False
    )  # NEEDS_REVIEW, PATIENT_VERIFIED, PATIENT_CORRECTED, REJECTED
    patient_corrected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    matched_existing_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    target_record_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    extraction: Mapped["DocumentExtraction"] = relationship("DocumentExtraction", back_populates="entities")


class TimelineEvent(Base, TimestampMixin):
    __tablename__ = "patient_timeline_events"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    patient_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("patient_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    event_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    source_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    patient: Mapped["PatientProfile"] = relationship("PatientProfile", back_populates="timeline_events")
