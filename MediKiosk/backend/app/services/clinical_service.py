"""Clinical service handling CRUD operations, file storage, timeline generation, and summaries."""
import os
import uuid
import shutil
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy import select, delete, desc
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.patient import PatientProfile
from backend.app.models.clinical import (
    Condition,
    Medication,
    Allergy,
    FamilyHistory,
    Surgery,
    MedicalDocument,
    TimelineEvent,
)
from backend.app.document.validation import validate_document_file, DocumentValidationError
from backend.app.schemas.clinical import (
    ConditionCreate, ConditionUpdate, ConditionOut,
    MedicationCreate, MedicationUpdate, MedicationOut,
    AllergyCreate, AllergyUpdate, AllergyOut,
    FamilyHistoryCreate, FamilyHistoryUpdate, FamilyHistoryOut,
    SurgeryCreate, SurgeryUpdate, SurgeryOut,
    MedicalDocumentCreate, MedicalDocumentUpdate, MedicalDocumentOut,
    TimelineEventOut, HealthSummaryOut, HealthRecordOut,
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


class ClinicalService:
    @staticmethod
    async def get_or_create_patient_profile(db: AsyncSession, user_id: str) -> PatientProfile:
        stmt = select(PatientProfile).where(PatientProfile.user_id == user_id)
        res = await db.execute(stmt)
        profile = res.scalars().first()
        if not profile:
            profile = PatientProfile(
                id=str(uuid.uuid4()),
                user_id=user_id,
                full_name="Patient User",
                onboarding_completed=False,
            )
            db.add(profile)
            await db.commit()
            await db.refresh(profile)
        return profile

    # -------------------------------------------------------------
    # Timeline Helper
    # -------------------------------------------------------------
    @staticmethod
    async def record_timeline_event(
        db: AsyncSession,
        patient_id: str,
        event_type: str,
        title: str,
        description: Optional[str],
        source_type: str,
        source_id: str,
        event_date: Optional[str] = None,
    ):
        if not event_date:
            event_date = datetime.now(timezone.utc).strftime("%d %b %Y")

        # Check if event for this source already exists
        stmt = select(TimelineEvent).where(
            TimelineEvent.patient_id == patient_id,
            TimelineEvent.source_type == source_type,
            TimelineEvent.source_id == source_id,
        )
        res = await db.execute(stmt)
        event = res.scalars().first()

        if event:
            event.event_type = event_type
            event.event_date = event_date
            event.title = title
            event.description = description
        else:
            event = TimelineEvent(
                id=str(uuid.uuid4()),
                patient_id=patient_id,
                event_type=event_type,
                event_date=event_date,
                title=title,
                description=description,
                source_type=source_type,
                source_id=source_id,
            )
            db.add(event)

    # -------------------------------------------------------------
    # Conditions
    # -------------------------------------------------------------
    @classmethod
    async def list_conditions(cls, db: AsyncSession, user_id: str) -> List[ConditionOut]:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(Condition).where(Condition.patient_id == profile.id).order_by(desc(Condition.created_at))
        res = await db.execute(stmt)
        return [ConditionOut.model_validate(c) for c in res.scalars().all()]

    @classmethod
    async def create_condition(cls, db: AsyncSession, user_id: str, data: ConditionCreate) -> ConditionOut:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        cond = Condition(
            id=str(uuid.uuid4()),
            patient_id=profile.id,
            condition_name=data.condition_name,
            diagnosis_date=data.diagnosis_date,
            status=data.status,
            doctor_hospital=data.doctor_hospital,
            notes=data.notes,
        )
        db.add(cond)
        await db.flush()

        await cls.record_timeline_event(
            db,
            patient_id=profile.id,
            event_type="CONDITION",
            title=f"Condition: {cond.condition_name}",
            description=f"Status: {cond.status}" + (f" | Notes: {cond.notes}" if cond.notes else ""),
            source_type="CONDITION",
            source_id=cond.id,
            event_date=cond.diagnosis_date,
        )
        await db.commit()
        await db.refresh(cond)
        return ConditionOut.model_validate(cond)

    @classmethod
    async def update_condition(cls, db: AsyncSession, user_id: str, condition_id: str, data: ConditionUpdate) -> ConditionOut:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(Condition).where(Condition.id == condition_id, Condition.patient_id == profile.id)
        res = await db.execute(stmt)
        cond = res.scalars().first()
        if not cond:
            raise HTTPException(status_code=404, detail="Condition not found or unauthorized.")

        if data.condition_name is not None:
            cond.condition_name = data.condition_name
        if data.diagnosis_date is not None:
            cond.diagnosis_date = data.diagnosis_date
        if data.status is not None:
            cond.status = data.status
        if data.doctor_hospital is not None:
            cond.doctor_hospital = data.doctor_hospital
        if data.notes is not None:
            cond.notes = data.notes

        await cls.record_timeline_event(
            db,
            patient_id=profile.id,
            event_type="CONDITION",
            title=f"Condition: {cond.condition_name}",
            description=f"Status: {cond.status}" + (f" | Notes: {cond.notes}" if cond.notes else ""),
            source_type="CONDITION",
            source_id=cond.id,
            event_date=cond.diagnosis_date,
        )
        await db.commit()
        await db.refresh(cond)
        return ConditionOut.model_validate(cond)

    @classmethod
    async def delete_condition(cls, db: AsyncSession, user_id: str, condition_id: str):
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(Condition).where(Condition.id == condition_id, Condition.patient_id == profile.id)
        res = await db.execute(stmt)
        cond = res.scalars().first()
        if not cond:
            raise HTTPException(status_code=404, detail="Condition not found or unauthorized.")

        await db.delete(cond)
        await db.execute(
            delete(TimelineEvent).where(
                TimelineEvent.patient_id == profile.id,
                TimelineEvent.source_type == "CONDITION",
                TimelineEvent.source_id == condition_id,
            )
        )
        await db.commit()
        return {"detail": "Condition deleted successfully"}

    # -------------------------------------------------------------
    # Medications
    # -------------------------------------------------------------
    @classmethod
    async def list_medications(cls, db: AsyncSession, user_id: str) -> List[MedicationOut]:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(Medication).where(Medication.patient_id == profile.id).order_by(desc(Medication.created_at))
        res = await db.execute(stmt)
        return [MedicationOut.model_validate(m) for m in res.scalars().all()]

    @classmethod
    async def create_medication(cls, db: AsyncSession, user_id: str, data: MedicationCreate) -> MedicationOut:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        med = Medication(
            id=str(uuid.uuid4()),
            patient_id=profile.id,
            medicine_name=data.medicine_name,
            dose=data.dose,
            frequency=data.frequency,
            route=data.route,
            start_date=data.start_date,
            end_date=data.end_date,
            prescribed_by=data.prescribed_by,
            purpose=data.purpose,
            status=data.status,
            notes=data.notes,
        )
        db.add(med)
        await db.flush()

        dose_info = f"{med.dose or ''} {med.frequency or ''}".strip()
        await cls.record_timeline_event(
            db,
            patient_id=profile.id,
            event_type="MEDICATION",
            title=f"Medicine: {med.medicine_name}",
            description=f"{dose_info} ({med.status})" + (f" | For: {med.purpose}" if med.purpose else ""),
            source_type="MEDICATION",
            source_id=med.id,
            event_date=med.start_date,
        )
        await db.commit()
        await db.refresh(med)
        return MedicationOut.model_validate(med)

    @classmethod
    async def update_medication(cls, db: AsyncSession, user_id: str, med_id: str, data: MedicationUpdate) -> MedicationOut:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(Medication).where(Medication.id == med_id, Medication.patient_id == profile.id)
        res = await db.execute(stmt)
        med = res.scalars().first()
        if not med:
            raise HTTPException(status_code=404, detail="Medication not found or unauthorized.")

        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(med, k, v)

        dose_info = f"{med.dose or ''} {med.frequency or ''}".strip()
        await cls.record_timeline_event(
            db,
            patient_id=profile.id,
            event_type="MEDICATION",
            title=f"Medicine: {med.medicine_name}",
            description=f"{dose_info} ({med.status})" + (f" | For: {med.purpose}" if med.purpose else ""),
            source_type="MEDICATION",
            source_id=med.id,
            event_date=med.start_date,
        )
        await db.commit()
        await db.refresh(med)
        return MedicationOut.model_validate(med)

    @classmethod
    async def delete_medication(cls, db: AsyncSession, user_id: str, med_id: str):
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(Medication).where(Medication.id == med_id, Medication.patient_id == profile.id)
        res = await db.execute(stmt)
        med = res.scalars().first()
        if not med:
            raise HTTPException(status_code=404, detail="Medication not found or unauthorized.")

        await db.delete(med)
        await db.execute(
            delete(TimelineEvent).where(
                TimelineEvent.patient_id == profile.id,
                TimelineEvent.source_type == "MEDICATION",
                TimelineEvent.source_id == med_id,
            )
        )
        await db.commit()
        return {"detail": "Medication deleted successfully"}

    # -------------------------------------------------------------
    # Allergies
    # -------------------------------------------------------------
    @classmethod
    async def list_allergies(cls, db: AsyncSession, user_id: str) -> List[AllergyOut]:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(Allergy).where(Allergy.patient_id == profile.id).order_by(desc(Allergy.created_at))
        res = await db.execute(stmt)
        return [AllergyOut.model_validate(a) for a in res.scalars().all()]

    @classmethod
    async def create_allergy(cls, db: AsyncSession, user_id: str, data: AllergyCreate) -> AllergyOut:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        alg = Allergy(
            id=str(uuid.uuid4()),
            patient_id=profile.id,
            allergen=data.allergen,
            reaction=data.reaction,
            severity=data.severity,
            notes=data.notes,
        )
        db.add(alg)
        await db.flush()

        await cls.record_timeline_event(
            db,
            patient_id=profile.id,
            event_type="ALLERGY",
            title=f"Allergy: {alg.allergen}",
            description=f"Reaction: {alg.reaction or 'Unknown'}, Severity: {alg.severity}",
            source_type="ALLERGY",
            source_id=alg.id,
        )
        await db.commit()
        await db.refresh(alg)
        return AllergyOut.model_validate(alg)

    @classmethod
    async def update_allergy(cls, db: AsyncSession, user_id: str, allergy_id: str, data: AllergyUpdate) -> AllergyOut:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(Allergy).where(Allergy.id == allergy_id, Allergy.patient_id == profile.id)
        res = await db.execute(stmt)
        alg = res.scalars().first()
        if not alg:
            raise HTTPException(status_code=404, detail="Allergy not found or unauthorized.")

        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(alg, k, v)

        await cls.record_timeline_event(
            db,
            patient_id=profile.id,
            event_type="ALLERGY",
            title=f"Allergy: {alg.allergen}",
            description=f"Reaction: {alg.reaction or 'Unknown'}, Severity: {alg.severity}",
            source_type="ALLERGY",
            source_id=alg.id,
        )
        await db.commit()
        await db.refresh(alg)
        return AllergyOut.model_validate(alg)

    @classmethod
    async def delete_allergy(cls, db: AsyncSession, user_id: str, allergy_id: str):
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(Allergy).where(Allergy.id == allergy_id, Allergy.patient_id == profile.id)
        res = await db.execute(stmt)
        alg = res.scalars().first()
        if not alg:
            raise HTTPException(status_code=404, detail="Allergy not found or unauthorized.")

        await db.delete(alg)
        await db.execute(
            delete(TimelineEvent).where(
                TimelineEvent.patient_id == profile.id,
                TimelineEvent.source_type == "ALLERGY",
                TimelineEvent.source_id == allergy_id,
            )
        )
        await db.commit()
        return {"detail": "Allergy deleted successfully"}

    # -------------------------------------------------------------
    # Family History
    # -------------------------------------------------------------
    @classmethod
    async def list_family(cls, db: AsyncSession, user_id: str) -> List[FamilyHistoryOut]:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(FamilyHistory).where(FamilyHistory.patient_id == profile.id).order_by(desc(FamilyHistory.created_at))
        res = await db.execute(stmt)
        return [FamilyHistoryOut.model_validate(f) for f in res.scalars().all()]

    @classmethod
    async def create_family(cls, db: AsyncSession, user_id: str, data: FamilyHistoryCreate) -> FamilyHistoryOut:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        fam = FamilyHistory(
            id=str(uuid.uuid4()),
            patient_id=profile.id,
            relation=data.relation,
            condition=data.condition,
            age_at_diagnosis=data.age_at_diagnosis,
            status=data.status,
            notes=data.notes,
        )
        db.add(fam)
        await db.commit()
        await db.refresh(fam)
        return FamilyHistoryOut.model_validate(fam)

    @classmethod
    async def update_family(cls, db: AsyncSession, user_id: str, family_id: str, data: FamilyHistoryUpdate) -> FamilyHistoryOut:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(FamilyHistory).where(FamilyHistory.id == family_id, FamilyHistory.patient_id == profile.id)
        res = await db.execute(stmt)
        fam = res.scalars().first()
        if not fam:
            raise HTTPException(status_code=404, detail="Family history record not found or unauthorized.")

        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(fam, k, v)

        await db.commit()
        await db.refresh(fam)
        return FamilyHistoryOut.model_validate(fam)

    @classmethod
    async def delete_family(cls, db: AsyncSession, user_id: str, family_id: str):
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(FamilyHistory).where(FamilyHistory.id == family_id, FamilyHistory.patient_id == profile.id)
        res = await db.execute(stmt)
        fam = res.scalars().first()
        if not fam:
            raise HTTPException(status_code=404, detail="Family history record not found or unauthorized.")

        await db.delete(fam)
        await db.commit()
        return {"detail": "Family record deleted successfully"}

    # -------------------------------------------------------------
    # Surgeries
    # -------------------------------------------------------------
    @classmethod
    async def list_surgeries(cls, db: AsyncSession, user_id: str) -> List[SurgeryOut]:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(Surgery).where(Surgery.patient_id == profile.id).order_by(desc(Surgery.created_at))
        res = await db.execute(stmt)
        return [SurgeryOut.model_validate(s) for s in res.scalars().all()]

    @classmethod
    async def create_surgery(cls, db: AsyncSession, user_id: str, data: SurgeryCreate) -> SurgeryOut:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        surg = Surgery(
            id=str(uuid.uuid4()),
            patient_id=profile.id,
            procedure_name=data.procedure_name,
            surgery_date=data.surgery_date,
            hospital=data.hospital,
            doctor=data.doctor,
            reason=data.reason,
            notes=data.notes,
        )
        db.add(surg)
        await db.flush()

        await cls.record_timeline_event(
            db,
            patient_id=profile.id,
            event_type="SURGERY",
            title=f"Surgery: {surg.procedure_name}",
            description=f"Hospital: {surg.hospital or 'Unknown'}" + (f" | Reason: {surg.reason}" if surg.reason else ""),
            source_type="SURGERY",
            source_id=surg.id,
            event_date=surg.surgery_date,
        )
        await db.commit()
        await db.refresh(surg)
        return SurgeryOut.model_validate(surg)

    @classmethod
    async def update_surgery(cls, db: AsyncSession, user_id: str, surgery_id: str, data: SurgeryUpdate) -> SurgeryOut:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(Surgery).where(Surgery.id == surgery_id, Surgery.patient_id == profile.id)
        res = await db.execute(stmt)
        surg = res.scalars().first()
        if not surg:
            raise HTTPException(status_code=404, detail="Surgery record not found or unauthorized.")

        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(surg, k, v)

        await cls.record_timeline_event(
            db,
            patient_id=profile.id,
            event_type="SURGERY",
            title=f"Surgery: {surg.procedure_name}",
            description=f"Hospital: {surg.hospital or 'Unknown'}" + (f" | Reason: {surg.reason}" if surg.reason else ""),
            source_type="SURGERY",
            source_id=surg.id,
            event_date=surg.surgery_date,
        )
        await db.commit()
        await db.refresh(surg)
        return SurgeryOut.model_validate(surg)

    @classmethod
    async def delete_surgery(cls, db: AsyncSession, user_id: str, surgery_id: str):
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(Surgery).where(Surgery.id == surgery_id, Surgery.patient_id == profile.id)
        res = await db.execute(stmt)
        surg = res.scalars().first()
        if not surg:
            raise HTTPException(status_code=404, detail="Surgery record not found or unauthorized.")

        await db.delete(surg)
        await db.execute(
            delete(TimelineEvent).where(
                TimelineEvent.patient_id == profile.id,
                TimelineEvent.source_type == "SURGERY",
                TimelineEvent.source_id == surgery_id,
            )
        )
        await db.commit()
        return {"detail": "Surgery record deleted successfully"}

    # -------------------------------------------------------------
    # Medical Documents & Uploads
    # -------------------------------------------------------------
    @classmethod
    async def list_documents(cls, db: AsyncSession, user_id: str) -> List[MedicalDocumentOut]:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(MedicalDocument).where(MedicalDocument.patient_id == profile.id).order_by(desc(MedicalDocument.uploaded_at))
        res = await db.execute(stmt)
        return [MedicalDocumentOut.model_validate(d) for d in res.scalars().all()]

    @classmethod
    async def get_document(cls, db: AsyncSession, user_id: str, doc_id: str) -> MedicalDocumentOut:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(MedicalDocument).where(MedicalDocument.id == doc_id, MedicalDocument.patient_id == profile.id)
        res = await db.execute(stmt)
        doc = res.scalars().first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found or unauthorized.")
        return MedicalDocumentOut.model_validate(doc)

    @classmethod
    async def upload_document_file(
        cls,
        db: AsyncSession,
        user_id: str,
        file: UploadFile,
        document_type: str,
        document_date: Optional[str] = None,
        hospital_name: Optional[str] = None,
        doctor_name: Optional[str] = None,
        patient_notes: Optional[str] = None,
    ) -> MedicalDocumentOut:
        profile = await cls.get_or_create_patient_profile(db, user_id)

        # Read file bytes
        file_bytes = await file.read()
        filename = file.filename or "document.pdf"

        # Validate file type, size, and corruption
        try:
            mime_type, file_ext = validate_document_file(file_bytes, filename, file.content_type)
        except DocumentValidationError as ve:
            raise HTTPException(status_code=400, detail=ve.user_message)

        # Generate unique storage key
        unique_key = f"{uuid.uuid4().hex}{file_ext}"
        destination = os.path.join(UPLOAD_DIR, unique_key)

        with open(destination, "wb") as buffer:
            buffer.write(file_bytes)
        file_size = len(file_bytes)

        file_url = f"/api/v1/patient/documents/file/{unique_key}"

        doc = MedicalDocument(
            id=str(uuid.uuid4()),
            patient_id=profile.id,
            document_type=document_type,
            file_name=filename,
            storage_key=unique_key,
            file_url=file_url,
            mime_type=mime_type,
            file_size=file_size,
            document_date=document_date or datetime.now(timezone.utc).strftime("%d %b %Y"),
            hospital_name=hospital_name,
            doctor_name=doctor_name,
            patient_notes=patient_notes,
            verification_status="Patient added",
        )
        db.add(doc)
        await db.flush()

        await cls.record_timeline_event(
            db,
            patient_id=profile.id,
            event_type="REPORT",
            title=f"Report: {doc.file_name}",
            description=f"Type: {doc.document_type}" + (f" | Hospital: {doc.hospital_name}" if doc.hospital_name else ""),
            source_type="REPORT",
            source_id=doc.id,
            event_date=doc.document_date,
        )
        await db.commit()
        await db.refresh(doc)
        return MedicalDocumentOut.model_validate(doc)

    @classmethod
    async def update_document(cls, db: AsyncSession, user_id: str, doc_id: str, data: MedicalDocumentUpdate) -> MedicalDocumentOut:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(MedicalDocument).where(MedicalDocument.id == doc_id, MedicalDocument.patient_id == profile.id)
        res = await db.execute(stmt)
        doc = res.scalars().first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found or unauthorized.")

        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(doc, k, v)

        await cls.record_timeline_event(
            db,
            patient_id=profile.id,
            event_type="REPORT",
            title=f"Report: {doc.file_name}",
            description=f"Type: {doc.document_type}" + (f" | Hospital: {doc.hospital_name}" if doc.hospital_name else ""),
            source_type="REPORT",
            source_id=doc.id,
            event_date=doc.document_date,
        )
        await db.commit()
        await db.refresh(doc)
        return MedicalDocumentOut.model_validate(doc)

    @classmethod
    async def delete_document(cls, db: AsyncSession, user_id: str, doc_id: str):
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(MedicalDocument).where(MedicalDocument.id == doc_id, MedicalDocument.patient_id == profile.id)
        res = await db.execute(stmt)
        doc = res.scalars().first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found or unauthorized.")

        # Optionally remove physical file
        try:
            file_path = os.path.join(UPLOAD_DIR, doc.storage_key)
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass

        await db.delete(doc)
        await db.execute(
            delete(TimelineEvent).where(
                TimelineEvent.patient_id == profile.id,
                TimelineEvent.source_type == "REPORT",
                TimelineEvent.source_id == doc_id,
            )
        )
        await db.commit()
        return {"detail": "Document deleted successfully"}

    @classmethod
    async def serve_file(cls, db: AsyncSession, user_id: str, filename: str) -> FileResponse:
        # Authorization check: verify document belongs to current user
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(MedicalDocument).where(
            MedicalDocument.storage_key == filename,
            MedicalDocument.patient_id == profile.id,
        )
        res = await db.execute(stmt)
        doc = res.scalars().first()
        if not doc:
            raise HTTPException(status_code=404, detail="File not found or unauthorized access.")

        file_path = os.path.join(UPLOAD_DIR, filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found on disk.")

        return FileResponse(file_path, media_type=doc.mime_type, filename=doc.file_name)

    # -------------------------------------------------------------
    # Timeline
    # -------------------------------------------------------------
    @classmethod
    async def get_timeline(cls, db: AsyncSession, user_id: str, filter_type: Optional[str] = None) -> List[TimelineEventOut]:
        profile = await cls.get_or_create_patient_profile(db, user_id)
        stmt = select(TimelineEvent).where(TimelineEvent.patient_id == profile.id)
        if filter_type and filter_type.upper() != "ALL":
            stmt = stmt.where(TimelineEvent.event_type == filter_type.upper())
        stmt = stmt.order_by(desc(TimelineEvent.created_at))
        res = await db.execute(stmt)
        return [TimelineEventOut.model_validate(e) for e in res.scalars().all()]

    # -------------------------------------------------------------
    # Summary & Aggregated Record
    # -------------------------------------------------------------
    @classmethod
    async def get_health_summary(cls, db: AsyncSession, user_id: str) -> HealthSummaryOut:
        profile = await cls.get_or_create_patient_profile(db, user_id)

        conds_res = await db.execute(select(Condition).where(Condition.patient_id == profile.id))
        conds = conds_res.scalars().all()
        active_conds = [c for c in conds if c.status.lower() in ("active", "under treatment")]

        meds_res = await db.execute(select(Medication).where(Medication.patient_id == profile.id))
        meds = meds_res.scalars().all()
        current_meds = [m for m in meds if m.status.lower() in ("currently taking", "active")]

        allergies_res = await db.execute(select(Allergy).where(Allergy.patient_id == profile.id))
        allergies = allergies_res.scalars().all()

        docs_res = await db.execute(select(MedicalDocument).where(MedicalDocument.patient_id == profile.id))
        docs = docs_res.scalars().all()

        surgeries_res = await db.execute(select(Surgery).where(Surgery.patient_id == profile.id))
        surgeries = surgeries_res.scalars().all()

        # Completeness calculation:
        # 20% for basic profile, 20% conditions, 20% medicines, 15% allergies, 15% reports, 10% family/surgeries
        score = 20 if profile.full_name else 0
        if conds: score += 20
        if meds: score += 20
        if allergies: score += 15
        if docs: score += 15
        if surgeries: score += 10
        completeness = min(100, score)

        last_updated = "Today"
        return HealthSummaryOut(
            conditions_count=len(conds),
            active_conditions_count=len(active_conds),
            medications_count=len(meds),
            current_medications_count=len(current_meds),
            allergies_count=len(allergies),
            reports_count=len(docs),
            surgeries_count=len(surgeries),
            completeness_percent=completeness,
            last_updated=last_updated,
        )

    @classmethod
    async def get_health_record(cls, db: AsyncSession, user_id: str) -> HealthRecordOut:
        summary = await cls.get_health_summary(db, user_id)
        conds = await cls.list_conditions(db, user_id)
        meds = await cls.list_medications(db, user_id)
        allergies = await cls.list_allergies(db, user_id)
        family = await cls.list_family(db, user_id)
        surgeries = await cls.list_surgeries(db, user_id)
        docs = await cls.list_documents(db, user_id)

        return HealthRecordOut(
            summary=summary,
            conditions=conds,
            medications=meds,
            allergies=allergies,
            family_history=family,
            surgeries=surgeries,
            recent_documents=docs,
        )
