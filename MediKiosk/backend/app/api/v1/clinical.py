"""Clinical endpoints for MediKiosk Phase 2: Patient Health Record."""
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user_payload
from backend.app.services.clinical_service import ClinicalService
from backend.app.schemas.clinical import (
    ConditionCreate, ConditionUpdate, ConditionOut,
    MedicationCreate, MedicationUpdate, MedicationOut,
    AllergyCreate, AllergyUpdate, AllergyOut,
    FamilyHistoryCreate, FamilyHistoryUpdate, FamilyHistoryOut,
    SurgeryCreate, SurgeryUpdate, SurgeryOut,
    MedicalDocumentUpdate, MedicalDocumentOut,
    TimelineEventOut, HealthSummaryOut, HealthRecordOut,
)

router = APIRouter(prefix="/patient", tags=["Patient Health Record"])


# -------------------------------------------------------------
# Overall Health Record & Summary
# -------------------------------------------------------------
@router.get("/health", response_model=HealthRecordOut)
async def get_health_record(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full aggregated personal health record for current patient."""
    return await ClinicalService.get_health_record(db, payload["sub"])


@router.get("/summary", response_model=HealthSummaryOut)
async def get_health_summary(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Calculate and return health record summary counts & completeness."""
    return await ClinicalService.get_health_summary(db, payload["sub"])


# -------------------------------------------------------------
# Conditions CRUD
# -------------------------------------------------------------
@router.get("/conditions", response_model=List[ConditionOut])
async def list_conditions(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.list_conditions(db, payload["sub"])


@router.post("/conditions", response_model=ConditionOut)
async def create_condition(
    data: ConditionCreate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.create_condition(db, payload["sub"], data)


@router.put("/conditions/{condition_id}", response_model=ConditionOut)
async def update_condition(
    condition_id: str,
    data: ConditionUpdate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.update_condition(db, payload["sub"], condition_id, data)


@router.delete("/conditions/{condition_id}")
async def delete_condition(
    condition_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.delete_condition(db, payload["sub"], condition_id)


# -------------------------------------------------------------
# Medications CRUD
# -------------------------------------------------------------
@router.get("/medicines", response_model=List[MedicationOut])
async def list_medicines(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.list_medications(db, payload["sub"])


@router.post("/medicines", response_model=MedicationOut)
async def create_medicine(
    data: MedicationCreate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.create_medication(db, payload["sub"], data)


@router.put("/medicines/{med_id}", response_model=MedicationOut)
async def update_medicine(
    med_id: str,
    data: MedicationUpdate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.update_medication(db, payload["sub"], med_id, data)


@router.delete("/medicines/{med_id}")
async def delete_medicine(
    med_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.delete_medication(db, payload["sub"], med_id)


# -------------------------------------------------------------
# Allergies CRUD
# -------------------------------------------------------------
@router.get("/allergies", response_model=List[AllergyOut])
async def list_allergies(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.list_allergies(db, payload["sub"])


@router.post("/allergies", response_model=AllergyOut)
async def create_allergy(
    data: AllergyCreate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.create_allergy(db, payload["sub"], data)


@router.put("/allergies/{allergy_id}", response_model=AllergyOut)
async def update_allergy(
    allergy_id: str,
    data: AllergyUpdate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.update_allergy(db, payload["sub"], allergy_id, data)


@router.delete("/allergies/{allergy_id}")
async def delete_allergy(
    allergy_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.delete_allergy(db, payload["sub"], allergy_id)


# -------------------------------------------------------------
# Family History CRUD
# -------------------------------------------------------------
@router.get("/family", response_model=List[FamilyHistoryOut])
async def list_family(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.list_family(db, payload["sub"])


@router.post("/family", response_model=FamilyHistoryOut)
async def create_family(
    data: FamilyHistoryCreate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.create_family(db, payload["sub"], data)


@router.put("/family/{family_id}", response_model=FamilyHistoryOut)
async def update_family(
    family_id: str,
    data: FamilyHistoryUpdate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.update_family(db, payload["sub"], family_id, data)


@router.delete("/family/{family_id}")
async def delete_family(
    family_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.delete_family(db, payload["sub"], family_id)


# -------------------------------------------------------------
# Surgeries CRUD
# -------------------------------------------------------------
@router.get("/surgeries", response_model=List[SurgeryOut])
async def list_surgeries(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.list_surgeries(db, payload["sub"])


@router.post("/surgeries", response_model=SurgeryOut)
async def create_surgery(
    data: SurgeryCreate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.create_surgery(db, payload["sub"], data)


@router.put("/surgeries/{surgery_id}", response_model=SurgeryOut)
async def update_surgery(
    surgery_id: str,
    data: SurgeryUpdate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.update_surgery(db, payload["sub"], surgery_id, data)


@router.delete("/surgeries/{surgery_id}")
async def delete_surgery(
    surgery_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.delete_surgery(db, payload["sub"], surgery_id)


# -------------------------------------------------------------
# Medical Documents CRUD & Upload
# -------------------------------------------------------------
@router.get("/documents", response_model=List[MedicalDocumentOut])
async def list_documents(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.list_documents(db, payload["sub"])


@router.get("/documents/{doc_id}", response_model=MedicalDocumentOut)
async def get_document(
    doc_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.get_document(db, payload["sub"], doc_id)


@router.post("/documents/upload", response_model=MedicalDocumentOut)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("prescription"),
    document_date: Optional[str] = Form(None),
    hospital_name: Optional[str] = Form(None),
    doctor_name: Optional[str] = Form(None),
    patient_notes: Optional[str] = Form(None),
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.upload_document_file(
        db=db,
        user_id=payload["sub"],
        file=file,
        document_type=document_type,
        document_date=document_date,
        hospital_name=hospital_name,
        doctor_name=doctor_name,
        patient_notes=patient_notes,
    )


@router.put("/documents/{doc_id}", response_model=MedicalDocumentOut)
async def update_document(
    doc_id: str,
    data: MedicalDocumentUpdate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.update_document(db, payload["sub"], doc_id, data)


@router.delete("/documents/{doc_id}")
async def delete_document(
    doc_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.delete_document(db, payload["sub"], doc_id)


@router.get("/documents/file/{filename}")
async def get_document_file(
    filename: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Securely stream/serve original file to authenticated owner."""
    return await ClinicalService.serve_file(db, payload["sub"], filename)


# -------------------------------------------------------------
# Timeline
# -------------------------------------------------------------
@router.get("/timeline", response_model=List[TimelineEventOut])
async def get_timeline(
    filter: Optional[str] = Query("ALL", alias="filter"),
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    return await ClinicalService.get_timeline(db, payload["sub"], filter)
