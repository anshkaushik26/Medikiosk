"""Document Intelligence API endpoints for MediKiosk Phase 3."""
from typing import List, Optional
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db, async_session_factory
from backend.app.core.security import get_current_user_payload
from backend.app.services.document_intelligence_service import DocumentIntelligenceService
from backend.app.schemas.document_intelligence import (
    DocumentExtractionOut, ExtractedEntityOut, ExtractedEntityUpdate,
    ProcessingStatusOut, VerifyEntityRequest, LabResultOut
)

router = APIRouter(prefix="/patient", tags=["Document Intelligence"])


async def _run_async_processing(user_id: str, document_id: str):
    """Background worker for document intelligence pipeline."""
    async with async_session_factory() as session:
        try:
            await DocumentIntelligenceService.process_document_job(session, user_id, document_id)
        except Exception as e:
            # Error is safely recorded inside the extraction record
            pass


@router.post("/documents/{document_id}/process", response_model=ProcessingStatusOut)
async def trigger_document_processing(
    document_id: str,
    background_tasks: BackgroundTasks,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Trigger background OCR and medical information extraction for an uploaded document."""
    # Launch processing in background task to avoid blocking HTTP request
    background_tasks.add_task(_run_async_processing, payload["sub"], document_id)
    return await DocumentIntelligenceService.get_processing_status(db, payload["sub"], document_id)


@router.get("/documents/{document_id}/processing-status", response_model=ProcessingStatusOut)
async def get_processing_status(
    document_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Poll the live processing state of a document."""
    return await DocumentIntelligenceService.get_processing_status(db, payload["sub"], document_id)


@router.get("/documents/{document_id}/extraction", response_model=DocumentExtractionOut)
async def get_document_extraction(
    document_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve the full structured extraction and source-linked entities for review."""
    return await DocumentIntelligenceService.get_extraction(db, payload["sub"], document_id)


@router.put("/documents/{document_id}/extraction/{entity_id}", response_model=ExtractedEntityOut)
async def update_extracted_entity(
    document_id: str,
    entity_id: str,
    data: ExtractedEntityUpdate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Patient edits an extracted value before confirming."""
    return await DocumentIntelligenceService.update_extracted_entity(
        db, payload["sub"], document_id, entity_id, data.entity_value
    )


@router.post("/documents/{document_id}/verify")
async def verify_document_extraction(
    document_id: str,
    data: VerifyEntityRequest,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """
    Patient verifies extracted entities.
    Promotes confirmed entities into real health records and updates the timeline.
    """
    return await DocumentIntelligenceService.verify_entities(
        db,
        user_id=payload["sub"],
        document_id=document_id,
        entity_ids=data.entity_ids,
        duplicate_resolution=data.duplicate_resolution or "ADD_NEW",
    )


@router.post("/documents/{document_id}/reject/{entity_id}", response_model=ExtractedEntityOut)
async def reject_extracted_entity(
    document_id: str,
    entity_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Patient rejects an extracted entity."""
    return await DocumentIntelligenceService.reject_entity(
        db, payload["sub"], document_id, entity_id
    )


@router.get("/lab-results", response_model=List[LabResultOut])
async def list_lab_results(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """List verified lab test results for authenticated patient."""
    return await DocumentIntelligenceService.list_lab_results(db, payload["sub"])
