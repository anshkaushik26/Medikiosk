"""OCR Provider abstract base class and standardized OCR result data models."""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    """Normalized bounding box percentages (0 to 100)."""
    x: float = Field(..., description="Top-left X coordinate percentage")
    y: float = Field(..., description="Top-left Y coordinate percentage")
    width: float = Field(..., description="Width percentage")
    height: float = Field(..., description="Height percentage")


class OCRWord(BaseModel):
    text: str
    confidence: float = 1.0
    bounding_box: Optional[BoundingBox] = None


class OCRLine(BaseModel):
    text: str
    confidence: float = 1.0
    words: List[OCRWord] = []
    bounding_box: Optional[BoundingBox] = None


class OCRPage(BaseModel):
    page_number: int = 1
    lines: List[OCRLine] = []
    full_text: str = ""
    confidence: float = 1.0


class OCRResult(BaseModel):
    full_text: str
    pages: List[OCRPage] = []
    detected_language: str = "en"  # "en", "hi", etc.
    average_confidence: float = 0.95
    provider_name: str = "BaseOCRProvider"


class OCRProvider(ABC):
    """Abstract base interface for OCR implementations."""

    @abstractmethod
    async def process(
        self,
        file_bytes: bytes,
        filename: str,
        mime_type: str,
        document_type: Optional[str] = None
    ) -> OCRResult:
        """Process raw file bytes and return standardized OCRResult."""
        pass
