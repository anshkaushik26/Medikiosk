"""Pydantic schemas for Document Intelligence & Medical Extraction."""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class ExtractedEntityOut(BaseModel):
    id: str
    document_extraction_id: str
    entity_type: str
    entity_value: Dict[str, Any]
    normalized_value: Optional[str] = None
    confidence: float
    page_number: int
    source_text: str
    bounding_box: Optional[Dict[str, Any]] = None
    verification_status: str
    patient_corrected: bool
    matched_existing_id: Optional[str] = None
    target_record_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExtractedEntityUpdate(BaseModel):
    entity_value: Dict[str, Any]


class DocumentExtractionOut(BaseModel):
    id: str
    document_id: str
    patient_id: str
    extraction_status: str
    current_step: str
    ocr_text: Optional[str] = None
    detected_language: str
    ocr_confidence: float
    structured_data: Optional[Dict[str, Any]] = None
    processing_provider: str
    quality_issues: Optional[str] = None
    processed_at: Optional[datetime] = None
    entities: List[ExtractedEntityOut] = []

    model_config = ConfigDict(from_attributes=True)


class ProcessingStatusOut(BaseModel):
    document_id: str
    extraction_id: Optional[str] = None
    extraction_status: str
    current_step: str
    quality_advisory: Optional[str] = None
    entities_count: int = 0


class VerifyEntityRequest(BaseModel):
    entity_ids: Optional[List[str]] = None
    duplicate_resolution: Optional[str] = "ADD_NEW"  # UPDATE_EXISTING, ADD_NEW, IGNORE


class LabResultOut(BaseModel):
    id: str
    patient_id: str
    document_id: Optional[str] = None
    test_name: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    status: str
    test_date: Optional[str] = None
    source_page: Optional[int] = 1
    source_text: Optional[str] = None
    confidence: float
    verification_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
