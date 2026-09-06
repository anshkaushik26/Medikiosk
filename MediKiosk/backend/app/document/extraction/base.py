"""Medical entity extraction base interfaces and data transfer models."""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from backend.app.document.ocr.base import OCRResult, BoundingBox


class ExtractedEntityDTO(BaseModel):
    entity_type: str  # MEDICATION, LAB_RESULT, CONDITION, ALLERGY, SURGERY, DOCTOR_NAME, HOSPITAL_NAME, DOCUMENT_DATE
    entity_value: Dict[str, Any]
    normalized_value: Optional[str] = None
    confidence: float = 0.95
    page_number: int = 1
    source_text: str = ""
    bounding_box: Optional[BoundingBox] = None


class DocumentExtractionResult(BaseModel):
    document_type: str
    entities: List[ExtractedEntityDTO] = []
    summary: Dict[str, Any] = {}
    extraction_provider: str = "BaseExtractor"


class MedicalExtractionProvider(ABC):
    """Abstract base for clinical entity extractors."""

    @abstractmethod
    async def extract(
        self,
        ocr_result: OCRResult,
        document_type: str
    ) -> DocumentExtractionResult:
        """Extract clinical entities from OCR result."""
        pass
