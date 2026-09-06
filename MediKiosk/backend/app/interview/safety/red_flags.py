"""Deterministic red-flag safety engine."""
from typing import Dict, Any, Optional, Tuple


class RedFlagSafetyEngine:
    """
    Evaluates clinical answer combinations against strict deterministic safety rules.
    Interrupts interview flow immediately when an urgent condition is suspected.
    NEVER diagnoses diseases.
    """

    @classmethod
    def evaluate(cls, branch: str, answers: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Returns (is_urgent, rule_name, advisory_message)
        """
        # Rule 1: Chest Pain + Difficulty Breathing
        if branch == "CHEST_PAIN":
            breathing = str(answers.get("CP_BREATHING", "")).upper()
            radiation = str(answers.get("CP_RADIATION", "")).upper()
            sweating = str(answers.get("CP_SWEATING", "")).upper()
            severity = str(answers.get("CP_SEVERITY", "")).upper()

            if "YES" in breathing:
                return (
                    True,
                    "CHEST_PAIN_WITH_DYSPNEA",
                    "Chest pain accompanied by difficulty breathing requires immediate emergency evaluation."
                )

            if ("YES" in radiation or "ARM" in radiation or "JAW" in radiation) and "YES" in sweating:
                return (
                    True,
                    "CHEST_PAIN_WITH_RADIATION_AND_SWEATING",
                    "Chest pain radiating to the arm/jaw with sweating requires urgent hospital evaluation."
                )

            if "SEVERE" in severity and ("YES" in radiation or "ARM" in radiation or "JAW" in radiation):
                return (
                    True,
                    "SEVERE_CHEST_PAIN_WITH_RADIATION",
                    "Severe chest pain spreading to arm or jaw requires urgent medical attention."
                )

        # Rule 2: Cough + Blood in Sputum (Hemoptysis)
        elif branch == "COUGH":
            blood = str(answers.get("COUGH_BLOOD", "")).upper()
            breathing = str(answers.get("COUGH_BREATHING", "")).upper()

            if "YES" in blood:
                return (
                    True,
                    "COUGH_WITH_HEMOPTYSIS",
                    "Coughing up blood is a serious symptom that needs urgent doctor examination."
                )

            if "SEVERE" in breathing:
                return (
                    True,
                    "COUGH_WITH_SEVERE_DYSPNEA",
                    "Severe breathing difficulty with cough requires urgent medical care."
                )

        # Rule 3: Fever + Severe Breathing Difficulty
        elif branch == "FEVER":
            breathing = str(answers.get("FEVER_BREATHING", "")).upper()
            if "SEVERE" in breathing:
                return (
                    True,
                    "FEVER_WITH_SEVERE_DYSPNEA",
                    "Fever with severe breathing difficulty requires immediate medical attention."
                )

        # Rule 4: Stomach Pain + Blood in Vomit or Stool
        elif branch == "STOMACH_PAIN":
            blood = str(answers.get("STOMACH_BLOOD", "")).upper()
            severity = str(answers.get("STOMACH_SEVERITY", "")).upper()

            if "YES" in blood:
                return (
                    True,
                    "STOMACH_PAIN_WITH_GI_BLEED",
                    "Stomach pain with blood in vomit or stool requires urgent hospital evaluation."
                )

            if "SEVERE" in severity and ("VOMIT_FREQUENT" in str(answers.get("STOMACH_VOMIT", "")).upper()):
                return (
                    True,
                    "SEVERE_ABDOMINAL_PAIN_WITH_PERSISTENT_VOMITING",
                    "Severe unbearable stomach pain with persistent vomiting needs urgent attention."
                )

        return (False, None, None)
