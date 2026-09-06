"""Document validation service with friendly error reporting."""
import io
import logging
from typing import Tuple, Optional
from PIL import Image
from pypdf import PdfReader
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "application/pdf": [".pdf"],
    "text/plain": [".txt"],
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf", ".txt"}


class DocumentValidationError(Exception):
    """Exception with user-friendly message and internal technical detail."""
    def __init__(self, user_message: str, technical_detail: str):
        super().__init__(user_message)
        self.user_message = user_message
        self.technical_detail = technical_detail


def validate_document_file(file_bytes: bytes, filename: str, content_type: Optional[str] = None) -> Tuple[str, str]:
    """
    Validate uploaded document for allowed type, size limit, and corruptions.
    Returns (cleaned_mime_type, extension).
    """
    # 1. Size check
    file_size = len(file_bytes)
    if file_size == 0:
        logger.warning(f"Validation failed: empty file received for '{filename}'")
        raise DocumentValidationError(
            user_message="The uploaded file appears to be empty. Please select or capture a valid document.",
            technical_detail=f"File size 0 bytes for '{filename}'",
        )

    if file_size > settings.MAX_UPLOAD_SIZE_BYTES:
        max_mb = settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)
        logger.warning(f"Validation failed: file size {file_size} exceeds {settings.MAX_UPLOAD_SIZE_BYTES}")
        raise DocumentValidationError(
            user_message=f"The selected file is too large. Please upload a document smaller than {max_mb} MB.",
            technical_detail=f"File size {file_size} > limit {settings.MAX_UPLOAD_SIZE_BYTES}",
        )

    # 2. Extension check
    dot_index = filename.rfind(".")
    ext = filename[dot_index:].lower() if dot_index != -1 else ""
    if ext not in ALLOWED_EXTENSIONS:
        logger.warning(f"Validation failed: unsupported extension '{ext}' for '{filename}'")
        raise DocumentValidationError(
            user_message="Unsupported file format. Please upload a photo (JPG, PNG) or a PDF document.",
            technical_detail=f"Extension '{ext}' not in {ALLOWED_EXTENSIONS}",
        )

    # 3. Content-Type and format verification
    if ext == ".pdf":
        mime_type = "application/pdf"
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            if len(reader.pages) == 0:
                raise ValueError("PDF has 0 pages")
        except Exception as e:
            logger.error(f"Corrupt PDF '{filename}': {e}")
            raise DocumentValidationError(
                user_message="We couldn't open this PDF document. It may be corrupt or protected.",
                technical_detail=f"PdfReader error: {str(e)}",
            )
    elif ext == ".txt":
        mime_type = "text/plain"
    else:
        # Image verification
        try:
            with Image.open(io.BytesIO(file_bytes)) as img:
                img.verify()  # Verify image integrity
                format_lower = (img.format or "").lower()
                if format_lower in ["jpeg", "jpg"]:
                    mime_type = "image/jpeg"
                elif format_lower == "png":
                    mime_type = "image/png"
                elif format_lower == "webp":
                    mime_type = "image/webp"
                else:
                    mime_type = content_type or "image/jpeg"
        except Exception as e:
            logger.error(f"Corrupt Image '{filename}': {e}")
            raise DocumentValidationError(
                user_message="We couldn't open this photo. Please try taking another photo or choosing a different image.",
                technical_detail=f"PIL verify error: {str(e)}",
            )

    return mime_type, ext
