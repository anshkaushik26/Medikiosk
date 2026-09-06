"""DocumentProcessor orchestrator for validation, quality, OCR, and medical entity extraction."""
from typing import Optional, Dict, Any
from backend.app.core.config import settings
from backend.app.document.validation import validate_document_file
from backend.app.document.quality import assess_document_quality
from backend.app.document.ocr.base import OCRResult, OCRProvider
from backend.app.document.ocr.mock_provider import MockOCRProvider
from backend.app.document.ocr.pdf_provider import PDFTextOCRProvider
from backend.app.document.ocr.paddleocr_provider import PaddleOCRProvider
from backend.app.document.extraction.medical_extractor import RuleBasedMedicalExtractor
from backend.app.document.extraction.base import DocumentExtractionResult


class DocumentProcessor:
    """High-level orchestrator for MediKiosk document intelligence."""

    @classmethod
    def get_ocr_provider(cls, mime_type: str) -> OCRProvider:
        if mime_type == "application/pdf":
            return PDFTextOCRProvider()

        provider_name = settings.DOCUMENT_OCR_PROVIDER.lower()
        if provider_name == "paddleocr":
            return PaddleOCRProvider()
        return MockOCRProvider()

    @classmethod
    async def process_document_pipeline(
        cls,
        file_bytes: bytes,
        filename: str,
        content_type: Optional[str] = None,
        document_type: str = "prescription",
    ) -> Dict[str, Any]:
        """
        Execute the complete processing pipeline:
        Validation -> Quality Assessment -> OCR -> Clinical Extraction
        """
        # 1. Validation
        mime_type, _ = validate_document_file(file_bytes, filename, content_type)

        # 2. Quality Assessment
        quality_res = assess_document_quality(file_bytes, mime_type)

        # 3. Select OCR Provider & Run OCR
        ocr_provider = cls.get_ocr_provider(mime_type)
        ocr_result: OCRResult = await ocr_provider.process(
            file_bytes=file_bytes,
            filename=filename,
            mime_type=mime_type,
            document_type=document_type,
        )

        # 4. Clinical Entity Extraction
        extractor = RuleBasedMedicalExtractor()
        extraction_res: DocumentExtractionResult = await extractor.extract(
            ocr_result=ocr_result,
            document_type=document_type,
        )

        return {
            "mime_type": mime_type,
            "quality": quality_res,
            "ocr_result": ocr_result,
            "extraction_result": extraction_res,
        }
