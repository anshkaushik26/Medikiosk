"""Document quality assessment service for pre-OCR inspection."""
import io
import math
from typing import Dict, Any, Optional
from PIL import Image, ImageStat


def assess_document_quality(file_bytes: bytes, mime_type: str) -> Dict[str, Any]:
    """
    Perform basic non-blocking quality check on uploaded document.
    Returns dictionary with:
      - is_good: bool
      - resolution: (width, height)
      - advisory_message: Optional[str]
      - suggestions: List[str]
    """
    if mime_type == "application/pdf":
        return {
            "is_good": True,
            "advisory_message": None,
            "suggestions": [],
            "resolution": None,
        }

    try:
        with Image.open(io.BytesIO(file_bytes)) as img:
            width, height = img.size
            stat = ImageStat.Stat(img.convert("L"))
            mean_brightness = stat.mean[0]  # 0 to 255
            stddev_contrast = stat.stddev[0]

            suggestions = []
            advisory = None

            # 1. Low resolution check
            if width < 500 or height < 500:
                suggestions.append("Image resolution is low. Text might appear blurry.")

            # 2. Extreme darkness or brightness
            if mean_brightness < 40:
                suggestions.append("The photo is quite dark. Please ensure good lighting.")
            elif mean_brightness > 230:
                suggestions.append("The photo is very bright or has glare. Avoid direct flash.")

            # 3. Very low contrast (washed out / completely blurred)
            if stddev_contrast < 15:
                suggestions.append("The document has low contrast and might be difficult to read.")

            if suggestions:
                advisory = "Your document may be difficult to read. Make sure lighting is bright and steady."

            return {
                "is_good": len(suggestions) == 0,
                "advisory_message": advisory,
                "suggestions": suggestions,
                "resolution": {"width": width, "height": height},
                "brightness": round(mean_brightness, 1),
            }
    except Exception:
        # Fallback gracefully
        return {
            "is_good": True,
            "advisory_message": None,
            "suggestions": [],
            "resolution": None,
        }
