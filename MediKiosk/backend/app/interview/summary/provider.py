"""Standard clinical history summary generator."""
from typing import Dict, Any, List, Optional


class ClinicalSummaryProvider:
    """Assembles structured clinical history from patient interview answers and existing records."""

    @classmethod
    def generate_summary(
        cls,
        branch: str,
        chief_complaint: str,
        answers: Dict[str, Any],
        patient_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        ctx = patient_context or {}
        hpi_items = []

        # Build History of Present Illness (HPI) based on answers
        for q_id, ans_val in answers.items():
            label = q_id.replace("CP_", "").replace("FEVER_", "").replace("COUGH_", "").replace("STOMACH_", "").replace("RC_", "").capitalize()
            val_str = str(ans_val.get("raw") if isinstance(ans_val, dict) else ans_val)
            hpi_items.append({"field": label, "value": val_str})

        return {
            "chief_complaint": chief_complaint,
            "branch": branch,
            "history_of_present_illness": hpi_items,
            "existing_conditions": [c.get("condition_name") for c in ctx.get("conditions", [])],
            "existing_medications": [f"{m.get('medicine_name')} ({m.get('dose', '')})" for m in ctx.get("medications", [])],
            "known_allergies": [a.get("allergen") for a in ctx.get("allergies", [])],
            "recent_lab_findings": [f"{l.get('test_name')}: {l.get('value')} {l.get('unit', '')}" for l in ctx.get("lab_results", [])[:3]],
            "review_of_systems": {
                "cardiovascular": "Reported" if branch == "CHEST_PAIN" else "Non-contributory",
                "respiratory": "Reported" if branch in ["CHEST_PAIN", "COUGH", "FEVER"] else "Non-contributory",
                "gastrointestinal": "Reported" if branch == "STOMACH_PAIN" else "Non-contributory",
            },
            "source_type": "Patient reported with AI assistance",
        }
