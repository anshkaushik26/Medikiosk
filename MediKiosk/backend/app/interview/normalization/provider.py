"""Natural language normalization service."""
import re
from typing import Dict, Any


class ClinicalInterpretationProvider:
    """Normalizes natural language/voice answers into structured fields without losing raw text."""

    @classmethod
    def normalize_answer(cls, question_id: str, raw_text: str) -> Dict[str, Any]:
        text_lower = raw_text.lower()
        normalized: Dict[str, Any] = {"raw": raw_text}

        # Onset normalization
        if "today" in text_lower or "morning" in text_lower or "hours" in text_lower:
            normalized["onset_category"] = "Today"
            if "morning" in text_lower:
                normalized["time_of_day"] = "Morning"
        elif "yesterday" in text_lower:
            normalized["onset_category"] = "Yesterday"
        elif "few days" in text_lower or "days" in text_lower:
            normalized["onset_category"] = "Recent (2-3 days)"
        elif "week" in text_lower:
            normalized["onset_category"] = "Prolonged (> 1 week)"

        # Severity normalization
        if any(w in text_lower for w in ["severe", "unbearable", "very strong", "terrible", "bad"]):
            normalized["severity"] = "Severe"
        elif any(w in text_lower for w in ["moderate", "medium", "quite a bit"]):
            normalized["severity"] = "Moderate"
        elif any(w in text_lower for w in ["mild", "slight", "little", "bearable"]):
            normalized["severity"] = "Mild"

        # Pain character
        if any(w in text_lower for w in ["pressure", "heavy", "heaviness", "tight", "tightness"]):
            normalized["character"] = "Pressure / Heavy"
        elif any(w in text_lower for w in ["burning", "heartburn", "acid"]):
            normalized["character"] = "Burning"
        elif any(w in text_lower for w in ["sharp", "stabbing", "piercing"]):
            normalized["character"] = "Sharp / Stabbing"

        # Yes / No detection
        if any(w in text_lower for w in ["yes", "yeah", "definitely", "haan", "ha"]):
            normalized["confirmed"] = True
        elif any(w in text_lower for w in ["no", "nah", "nope", "nahi"]):
            normalized["confirmed"] = False

        return normalized
