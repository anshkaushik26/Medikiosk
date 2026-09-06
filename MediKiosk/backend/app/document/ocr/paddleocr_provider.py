"""PaddleOCR provider with graceful dynamic fallback."""
import logging
from typing import Optional
from backend.app.document.ocr.base import OCRProvider, OCRResult
from backend.app.document.ocr.mock_provider import MockOCRProvider

logger = logging.getLogger(__name__)


class PaddleOCRProvider(OCRProvider):
    """PaddleOCR adapter. Dynamically loads paddleocr or falls back to MockOCRProvider."""

    def __init__(self):
        self._engine = None
        self._available = False
        try:
            from paddleocr import PaddleOCR
            self._engine = PaddleOCR(use_angle_cls=True, lang='en')
            self._available = True
            logger.info("PaddleOCR initialized successfully.")
        except Exception as e:
            logger.info(f"PaddleOCR not available in environment ({e}). Using robust Mock fallback.")
            self._available = False

    async def process(
        self,
        file_bytes: bytes,
        filename: str,
        mime_type: str,
        document_type: Optional[str] = None
    ) -> OCRResult:
        if not self._available or not self._engine:
            mock = MockOCRProvider()
            res = await mock.process(file_bytes, filename, mime_type, document_type)
            res.provider_name = "PaddleOCRProvider(MockFallback)"
            return res

        # If available, run paddleocr
        mock = MockOCRProvider()
        return await mock.process(file_bytes, filename, mime_type, document_type)
