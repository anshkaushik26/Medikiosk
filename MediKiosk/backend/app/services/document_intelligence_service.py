"""Document Intelligence business logic service."""
import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.patient import PatientProfile
from backend.app.models.clinical import (
    MedicalDocument, DocumentExtraction, ExtractedEntity,
    Medication, Condition, LabResult, Surgery, TimelineEvent
)
from backend.app.document.processor import DocumentProcessor
from backend.app.document.validation import DocumentValidationError

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")


class DocumentIntelligenceService:
    """Service layer for document intelligence, entity verification, and health record integration."""

    @classmethod
    async def _get_patient_profile(cls, db: AsyncSession, user_id: str) -> PatientProfile:
        stmt = select(PatientProfile).where(PatientProfile.user_id == user_id)
        res = await db.execute(stmt)
        profile = res.scalars().first()
        if not profile:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        return profile

    @classmethod
    async def _get_authorized_document(cls, db: AsyncSession, user_id: str, document_id: str) -> MedicalDocument:
        profile = await cls._get_patient_profile(db, user_id)
        stmt = select(MedicalDocument).where(
            and_(MedicalDocument.id == document_id, MedicalDocument.patient_id == profile.id)
        )
        res = await db.execute(stmt)
        doc = res.scalars().first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found or unauthorized")
        return doc

    @classmethod
    async def process_document_job(cls, db: AsyncSession, user_id: str, document_id: str) -> DocumentExtraction:
        """Execute end-to-end OCR and medical extraction for a document."""
        doc = await cls._get_authorized_document(db, user_id, document_id)
        patient_id = doc.patient_id

        # 1. Get or create DocumentExtraction record
        stmt = select(DocumentExtraction).where(DocumentExtraction.document_id == document_id)
        res = await db.execute(stmt)
        extraction = res.scalars().first()

        if not extraction:
            extraction = DocumentExtraction(
                id=str(uuid.uuid4()),
                document_id=document_id,
                patient_id=patient_id,
                extraction_status="PROCESSING",
                current_step="Reading document",
            )
            db.add(extraction)
        else:
            extraction.extraction_status = "PROCESSING"
            extraction.current_step = "Reading document"
        await db.commit()
        await db.refresh(extraction)

        # 2. Read file from disk
        file_path = os.path.join(UPLOAD_DIR, doc.storage_key)
        if not os.path.exists(file_path):
            extraction.extraction_status = "FAILED"
            extraction.current_step = "File not found"
            await db.commit()
            raise HTTPException(status_code=404, detail="Original document file not found on server")

        with open(file_path, "rb") as f:
            file_bytes = f.read()

        # 3. Run DocumentProcessor
        try:
            extraction.current_step = "Finding medical information"
            await db.commit()

            pipeline_res = await DocumentProcessor.process_document_pipeline(
                file_bytes=file_bytes,
                filename=doc.file_name,
                content_type=doc.mime_type,
                document_type=doc.document_type,
            )

            extraction.current_step = "Organizing information"
            await db.commit()

            ocr_res = pipeline_res["ocr_result"]
            extract_res = pipeline_res["extraction_result"]
            quality_res = pipeline_res["quality"]

            extraction.ocr_text = ocr_res.full_text
            extraction.detected_language = ocr_res.detected_language
            extraction.ocr_confidence = ocr_res.average_confidence
            extraction.structured_data = extract_res.summary
            extraction.processing_provider = ocr_res.provider_name
            extraction.quality_issues = quality_res.get("advisory_message")
            extraction.processed_at = datetime.now(timezone.utc)
            extraction.extraction_status = "NEEDS_REVIEW"
            extraction.current_step = "Preparing for your review"

            # 4. Clean up any previous extraction entities
            old_entities_stmt = select(ExtractedEntity).where(
                ExtractedEntity.document_extraction_id == extraction.id
            )
            old_entities = (await db.execute(old_entities_stmt)).scalars().all()
            for old_e in old_entities:
                await db.delete(old_e)

            # 5. Check existing records for duplicate detection
            existing_meds_res = await db.execute(
                select(Medication).where(Medication.patient_id == patient_id)
            )
            existing_meds = {m.medicine_name.lower(): m.id for m in existing_meds_res.scalars().all()}

            existing_conds_res = await db.execute(
                select(Condition).where(Condition.patient_id == patient_id)
            )
            existing_conds = {c.condition_name.lower(): c.id for c in existing_conds_res.scalars().all()}

            # 6. Insert new extracted entities
            new_entities = []
            for dto in extract_res.entities:
                matched_id = None
                if dto.entity_type == "MEDICATION":
                    m_name = dto.entity_value.get("medicine_name", "").lower()
                    matched_id = existing_meds.get(m_name)
                elif dto.entity_type == "CONDITION":
                    c_name = dto.entity_value.get("condition_name", "").lower()
                    matched_id = existing_conds.get(c_name)

                bbox_dict = dto.bounding_box.model_dump() if dto.bounding_box else None

                ent = ExtractedEntity(
                    id=str(uuid.uuid4()),
                    document_extraction_id=extraction.id,
                    entity_type=dto.entity_type,
                    entity_value=dto.entity_value,
                    normalized_value=dto.normalized_value,
                    confidence=dto.confidence,
                    page_number=dto.page_number,
                    source_text=dto.source_text,
                    bounding_box=bbox_dict,
                    verification_status="NEEDS_REVIEW",
                    patient_corrected=False,
                    matched_existing_id=matched_id,
                )
                new_entities.append(ent)

            db.add_all(new_entities)
            await db.commit()

            stmt_reload = (
                select(DocumentExtraction)
                .where(DocumentExtraction.id == extraction.id)
                .options(selectinload(DocumentExtraction.entities))
            )
            reloaded = (await db.execute(stmt_reload)).scalars().first()
            return reloaded or extraction

        except DocumentValidationError as ve:
            extraction.extraction_status = "FAILED"
            extraction.current_step = ve.user_message
            await db.commit()
            raise HTTPException(status_code=400, detail=ve.user_message)
        except Exception as e:
            extraction.extraction_status = "FAILED"
            extraction.current_step = "Processing failed"
            await db.commit()
            raise HTTPException(status_code=500, detail=f"Document intelligence error: {str(e)}")

    @classmethod
    async def get_processing_status(cls, db: AsyncSession, user_id: str, document_id: str) -> Dict[str, Any]:
        """Retrieve the live status and current step of document processing."""
        doc = await cls._get_authorized_document(db, user_id, document_id)
        stmt = select(DocumentExtraction).where(DocumentExtraction.document_id == doc.id)
        res = await db.execute(stmt)
        extraction = res.scalars().first()

        if not extraction:
            return {
                "document_id": doc.id,
                "extraction_id": None,
                "extraction_status": "QUEUED",
                "current_step": "Uploading document",
                "quality_advisory": None,
                "entities_count": 0,
            }

        count_stmt = select(ExtractedEntity).where(ExtractedEntity.document_extraction_id == extraction.id)
        entities = (await db.execute(count_stmt)).scalars().all()

        return {
            "document_id": doc.id,
            "extraction_id": extraction.id,
            "extraction_status": extraction.extraction_status,
            "current_step": extraction.current_step,
            "quality_advisory": extraction.quality_issues,
            "entities_count": len(entities),
        }

    @classmethod
    async def get_extraction(cls, db: AsyncSession, user_id: str, document_id: str) -> DocumentExtraction:
        """Retrieve the full extraction with source bounding boxes."""
        doc = await cls._get_authorized_document(db, user_id, document_id)
        stmt = (
            select(DocumentExtraction)
            .where(DocumentExtraction.document_id == doc.id)
            .options(selectinload(DocumentExtraction.entities))
        )
        res = await db.execute(stmt)
        extraction = res.scalars().first()
        if not extraction:
            # Trigger processing if not done yet
            return await cls.process_document_job(db, user_id, document_id)
        return extraction

    @classmethod
    async def update_extracted_entity(
        cls,
        db: AsyncSession,
        user_id: str,
        document_id: str,
        entity_id: str,
        entity_value: Dict[str, Any]
    ) -> ExtractedEntity:
        """Allow patient to edit an extracted entity before confirming."""
        doc = await cls._get_authorized_document(db, user_id, document_id)
        stmt = select(ExtractedEntity).where(ExtractedEntity.id == entity_id)
        res = await db.execute(stmt)
        entity = res.scalars().first()
        if not entity:
            raise HTTPException(status_code=404, detail="Entity not found")

        entity.entity_value = entity_value
        entity.patient_corrected = True
        entity.verification_status = "PATIENT_CORRECTED"
        await db.commit()
        await db.refresh(entity)
        return entity

    @classmethod
    async def verify_entities(
        cls,
        db: AsyncSession,
        user_id: str,
        document_id: str,
        entity_ids: Optional[List[str]] = None,
        duplicate_resolution: str = "ADD_NEW",
    ) -> Dict[str, Any]:
        """
        Patient confirms extracted entity/entities.
        Promotes entities into verified Medication / LabResult / Condition records.
        Updates Medical Timeline automatically.
        """
        doc = await cls._get_authorized_document(db, user_id, document_id)
        patient_id = doc.patient_id

        stmt = select(DocumentExtraction).where(DocumentExtraction.document_id == doc.id)
        extraction = (await db.execute(stmt)).scalars().first()
        if not extraction:
            raise HTTPException(status_code=404, detail="Extraction not found")

        entities_stmt = select(ExtractedEntity).where(
            ExtractedEntity.document_extraction_id == extraction.id
        )
        if entity_ids:
            entities_stmt = entities_stmt.where(ExtractedEntity.id.in_(entity_ids))

        entities = (await db.execute(entities_stmt)).scalars().all()
        confirmed_count = 0

        for ent in entities:
            if ent.verification_status == "REJECTED":
                continue

            val = ent.entity_value
            ent_type = ent.entity_type.upper()

            # 1. MEDICATION
            if ent_type == "MEDICATION":
                med_name = val.get("medicine_name", "Prescription Medicine")
                dose = val.get("dose", "")
                freq = val.get("frequency", "")
                inst = val.get("instructions", "")
                notes = f"Source: {doc.file_name}. {inst}".strip()

                if duplicate_resolution == "UPDATE_EXISTING" and ent.matched_existing_id:
                    # Update existing
                    exist_med = await db.get(Medication, ent.matched_existing_id)
                    if exist_med:
                        exist_med.dose = dose or exist_med.dose
                        exist_med.frequency = freq or exist_med.frequency
                        exist_med.notes = notes
                        ent.target_record_id = exist_med.id
                else:
                    new_med = Medication(
                        id=str(uuid.uuid4()),
                        patient_id=patient_id,
                        medicine_name=med_name,
                        dose=dose,
                        frequency=freq,
                        status="Currently taking",
                        notes=notes,
                        source_document_id=doc.id,
                    )
                    db.add(new_med)
                    await db.flush()
                    ent.target_record_id = new_med.id

                    # Add Timeline event
                    t_evt = TimelineEvent(
                        id=str(uuid.uuid4()),
                        patient_id=patient_id,
                        event_type="MEDICATION",
                        event_date=doc.document_date or datetime.now(timezone.utc).strftime("%d %b %Y"),
                        title=f"Medicine Added: {med_name}",
                        description=f"{dose} {freq}. Source: {doc.file_name}",
                        source_type="DOCUMENT",
                        source_id=doc.id,
                    )
                    db.add(t_evt)

                ent.verification_status = "PATIENT_VERIFIED"
                confirmed_count += 1

            # 2. LAB RESULT
            elif ent_type == "LAB_RESULT":
                t_name = val.get("test_name", "Lab Test")
                num_val = str(val.get("value", ""))
                unit = val.get("unit", "")
                ref = val.get("reference_range", "")
                stat = val.get("status", "WITHIN_RANGE")

                new_lab = LabResult(
                    id=str(uuid.uuid4()),
                    patient_id=patient_id,
                    document_id=doc.id,
                    test_name=t_name,
                    value=num_val,
                    unit=unit,
                    reference_range=ref,
                    status=stat,
                    test_date=doc.document_date,
                    source_page=ent.page_number,
                    source_text=ent.source_text,
                    confidence=ent.confidence,
                    verification_status="PATIENT_VERIFIED",
                )
                db.add(new_lab)
                await db.flush()
                ent.target_record_id = new_lab.id

                # Add Timeline event
                t_evt = TimelineEvent(
                    id=str(uuid.uuid4()),
                    patient_id=patient_id,
                    event_type="REPORT",
                    event_date=doc.document_date or datetime.now(timezone.utc).strftime("%d %b %Y"),
                    title=f"Lab Test Added: {t_name}",
                    description=f"{t_name} ? {num_val} {unit} ({val.get('status_label', stat)}). Source: {doc.file_name}",
                    source_type="DOCUMENT",
                    source_id=doc.id,
                )
                db.add(t_evt)

                ent.verification_status = "PATIENT_VERIFIED"
                confirmed_count += 1

            # 3. CONDITION
            elif ent_type == "CONDITION":
                cond_name = val.get("condition_name", "Medical Condition")
                new_cond = Condition(
                    id=str(uuid.uuid4()),
                    patient_id=patient_id,
                    condition_name=cond_name,
                    diagnosis_date=doc.document_date,
                    status="Under treatment",
                    doctor_hospital=doc.hospital_name or doc.doctor_name,
                    notes=f"Extracted from {doc.file_name}",
                    source_document_id=doc.id,
                )
                db.add(new_cond)
                await db.flush()
                ent.target_record_id = new_cond.id

                t_evt = TimelineEvent(
                    id=str(uuid.uuid4()),
                    patient_id=patient_id,
                    event_type="CONDITION",
                    event_date=doc.document_date or datetime.now(timezone.utc).strftime("%d %b %Y"),
                    title=f"Condition Added: {cond_name}",
                    description=f"Diagnosed from {doc.file_name}",
                    source_type="DOCUMENT",
                    source_id=doc.id,
                )
                db.add(t_evt)

                ent.verification_status = "PATIENT_VERIFIED"
                confirmed_count += 1

            # 4. SURGERY
            elif ent_type == "SURGERY":
                proc_name = val.get("procedure_name", "Surgical Procedure")
                new_surg = Surgery(
                    id=str(uuid.uuid4()),
                    patient_id=patient_id,
                    procedure_name=proc_name,
                    surgery_date=doc.document_date,
                    hospital=doc.hospital_name,
                    doctor=doc.doctor_name,
                    notes=f"Source: {doc.file_name}",
                    source_document_id=doc.id,
                )
                db.add(new_surg)
                await db.flush()
                ent.target_record_id = new_surg.id

                t_evt = TimelineEvent(
                    id=str(uuid.uuid4()),
                    patient_id=patient_id,
                    event_type="SURGERY",
                    event_date=doc.document_date or datetime.now(timezone.utc).strftime("%d %b %Y"),
                    title=f"Surgery Recorded: {proc_name}",
                    description=f"Recorded from {doc.file_name}",
                    source_type="DOCUMENT",
                    source_id=doc.id,
                )
                db.add(t_evt)

                ent.verification_status = "PATIENT_VERIFIED"
                confirmed_count += 1

            # 5. DOCTOR_NAME
            elif ent_type == "DOCTOR_NAME":
                d_name = val.get("doctor_name")
                if d_name:
                    doc.doctor_name = d_name
                ent.verification_status = "PATIENT_VERIFIED"
                confirmed_count += 1

            # 6. HOSPITAL_NAME
            elif ent_type == "HOSPITAL_NAME":
                h_name = val.get("hospital_name")
                if h_name:
                    doc.hospital_name = h_name
                ent.verification_status = "PATIENT_VERIFIED"
                confirmed_count += 1

            # 7. DOCUMENT_DATE
            elif ent_type == "DOCUMENT_DATE":
                d_date = val.get("date")
                if d_date:
                    doc.document_date = d_date
                ent.verification_status = "PATIENT_VERIFIED"
                confirmed_count += 1

            else:
                ent.verification_status = "PATIENT_VERIFIED"
                confirmed_count += 1

        # Check if all entities are confirmed/handled
        all_ents = (await db.execute(
            select(ExtractedEntity).where(ExtractedEntity.document_extraction_id == extraction.id)
        )).scalars().all()

        unverified = [e for e in all_ents if e.verification_status == "NEEDS_REVIEW"]
        if not unverified:
            extraction.extraction_status = "PATIENT_VERIFIED"
            doc.verification_status = "Patient verified"

        await db.commit()
        return {
            "status": "success",
            "confirmed_count": confirmed_count,
            "message": f"Successfully verified {confirmed_count} clinical entities and updated Health Record.",
        }

    @classmethod
    async def reject_entity(
        cls,
        db: AsyncSession,
        user_id: str,
        document_id: str,
        entity_id: str
    ) -> ExtractedEntity:
        """Patient rejects an extracted entity."""
        doc = await cls._get_authorized_document(db, user_id, document_id)
        stmt = select(ExtractedEntity).where(ExtractedEntity.id == entity_id)
        res = await db.execute(stmt)
        entity = res.scalars().first()
        if not entity:
            raise HTTPException(status_code=404, detail="Entity not found")

        entity.verification_status = "REJECTED"
        await db.commit()
        await db.refresh(entity)
        return entity

    @classmethod
    async def list_lab_results(cls, db: AsyncSession, user_id: str) -> List[LabResult]:
        """List verified lab test results for authenticated patient."""
        profile = await cls._get_patient_profile(db, user_id)
        stmt = select(LabResult).where(
            LabResult.patient_id == profile.id
        ).order_by(LabResult.created_at.desc())
        res = await db.execute(stmt)
        return res.scalars().all()
