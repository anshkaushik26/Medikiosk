"""Clinical data schemas for MediKiosk Phase 2: Patient Health Record."""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# -------------------------------------------------------------
# Conditions
# -------------------------------------------------------------
class ConditionCreate(BaseModel):
    condition_name: str = Field(..., min_length=1, max_length=150)
    diagnosis_date: Optional[str] = None
    status: str = Field(default="Active")  # Active, Resolved, Under treatment, Unknown
    doctor_hospital: Optional[str] = None
    notes: Optional[str] = None


class ConditionUpdate(BaseModel):
    condition_name: Optional[str] = None
    diagnosis_date: Optional[str] = None
    status: Optional[str] = None
    doctor_hospital: Optional[str] = None
    notes: Optional[str] = None


class ConditionOut(BaseModel):
    id: str
    patient_id: str
    condition_name: str
    diagnosis_date: Optional[str] = None
    status: str
    doctor_hospital: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Medications
# -------------------------------------------------------------
class MedicationCreate(BaseModel):
    medicine_name: str = Field(..., min_length=1, max_length=150)
    dose: Optional[str] = None
    frequency: Optional[str] = None
    route: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    prescribed_by: Optional[str] = None
    purpose: Optional[str] = None
    status: str = Field(default="Currently taking")  # Currently taking, Finished, Stopped, Unknown
    notes: Optional[str] = None


class MedicationUpdate(BaseModel):
    medicine_name: Optional[str] = None
    dose: Optional[str] = None
    frequency: Optional[str] = None
    route: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    prescribed_by: Optional[str] = None
    purpose: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class MedicationOut(BaseModel):
    id: str
    patient_id: str
    medicine_name: str
    dose: Optional[str] = None
    frequency: Optional[str] = None
    route: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    prescribed_by: Optional[str] = None
    purpose: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Allergies
# -------------------------------------------------------------
class AllergyCreate(BaseModel):
    allergen: str = Field(..., min_length=1, max_length=150)
    reaction: Optional[str] = None
    severity: str = Field(default="Moderate")  # Mild, Moderate, Severe, Unknown
    notes: Optional[str] = None


class AllergyUpdate(BaseModel):
    allergen: Optional[str] = None
    reaction: Optional[str] = None
    severity: Optional[str] = None
    notes: Optional[str] = None


class AllergyOut(BaseModel):
    id: str
    patient_id: str
    allergen: str
    reaction: Optional[str] = None
    severity: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Family History
# -------------------------------------------------------------
class FamilyHistoryCreate(BaseModel):
    relation: str = Field(..., min_length=1, max_length=50)  # Father, Mother, Brother, etc.
    condition: str = Field(..., min_length=1, max_length=150)
    age_at_diagnosis: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class FamilyHistoryUpdate(BaseModel):
    relation: Optional[str] = None
    condition: Optional[str] = None
    age_at_diagnosis: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class FamilyHistoryOut(BaseModel):
    id: str
    patient_id: str
    relation: str
    condition: str
    age_at_diagnosis: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Surgeries
# -------------------------------------------------------------
class SurgeryCreate(BaseModel):
    procedure_name: str = Field(..., min_length=1, max_length=200)
    surgery_date: Optional[str] = None
    hospital: Optional[str] = None
    doctor: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None


class SurgeryUpdate(BaseModel):
    procedure_name: Optional[str] = None
    surgery_date: Optional[str] = None
    hospital: Optional[str] = None
    doctor: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None


class SurgeryOut(BaseModel):
    id: str
    patient_id: str
    procedure_name: str
    surgery_date: Optional[str] = None
    hospital: Optional[str] = None
    doctor: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Medical Documents
# -------------------------------------------------------------
class MedicalDocumentCreate(BaseModel):
    document_type: str = Field(..., min_length=1, max_length=50)
    file_name: str = Field(..., min_length=1, max_length=255)
    storage_key: str = Field(..., min_length=1, max_length=255)
    file_url: Optional[str] = None
    mime_type: str = Field(default="application/pdf")
    file_size: int = Field(default=0)
    document_date: Optional[str] = None
    hospital_name: Optional[str] = None
    doctor_name: Optional[str] = None
    patient_notes: Optional[str] = None
    verification_status: str = Field(default="Patient added")  # Patient added or Doctor verified


class MedicalDocumentUpdate(BaseModel):
    document_type: Optional[str] = None
    document_date: Optional[str] = None
    hospital_name: Optional[str] = None
    doctor_name: Optional[str] = None
    patient_notes: Optional[str] = None
    verification_status: Optional[str] = None


class MedicalDocumentOut(BaseModel):
    id: str
    patient_id: str
    document_type: str
    file_name: str
    storage_key: str
    file_url: Optional[str] = None
    mime_type: str
    file_size: int
    document_date: Optional[str] = None
    uploaded_at: datetime
    hospital_name: Optional[str] = None
    doctor_name: Optional[str] = None
    patient_notes: Optional[str] = None
    verification_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Timeline Events
# -------------------------------------------------------------
class TimelineEventOut(BaseModel):
    id: str
    patient_id: str
    event_type: str  # CONDITION, MEDICATION, ALLERGY, REPORT, SURGERY, etc.
    event_date: Optional[str] = None
    title: str
    description: Optional[str] = None
    source_type: Optional[str] = None
    source_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Health Summary & Aggregation
# -------------------------------------------------------------
class HealthSummaryOut(BaseModel):
    conditions_count: int = 0
    active_conditions_count: int = 0
    medications_count: int = 0
    current_medications_count: int = 0
    allergies_count: int = 0
    reports_count: int = 0
    surgeries_count: int = 0
    completeness_percent: int = 0
    last_updated: Optional[str] = None


class HealthRecordOut(BaseModel):
    summary: HealthSummaryOut
    conditions: List[ConditionOut] = []
    medications: List[MedicationOut] = []
    allergies: List[AllergyOut] = []
    family_history: List[FamilyHistoryOut] = []
    surgeries: List[SurgeryOut] = []
    recent_documents: List[MedicalDocumentOut] = []
