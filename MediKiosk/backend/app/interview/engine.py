"""InterviewEngine: central state machine driving clinical flows."""
from typing import Dict, Any, Optional, Tuple
from backend.app.interview.questions.base import QuestionBranch
from backend.app.interview.questions.chest_pain import ChestPainBranch
from backend.app.interview.questions.fever import FeverBranch
from backend.app.interview.questions.cough import CoughBranch
from backend.app.interview.questions.stomach_pain import StomachPainBranch
from backend.app.interview.questions.routine_checkup import RoutineCheckupBranch
from backend.app.interview.safety.red_flags import RedFlagSafetyEngine
from backend.app.interview.normalization.provider import ClinicalInterpretationProvider
from backend.app.interview.summary.provider import ClinicalSummaryProvider
from backend.app.interview.state import QuestionDTO, QuestionOption


class InterviewEngine:
    BRANCHES: Dict[str, QuestionBranch] = {
        "CHEST_PAIN": ChestPainBranch(),
        "FEVER": FeverBranch(),
        "COUGH": CoughBranch(),
        "STOMACH_PAIN": StomachPainBranch(),
        "ROUTINE_CHECKUP": RoutineCheckupBranch(),
    }

    @classmethod
    def get_initial_question(cls) -> QuestionDTO:
        """First question: What is bothering you today?"""
        return QuestionDTO(
            id="START",
            branch="GENERAL",
            text="What is bothering you today?",
            text_hi="आज आपको क्या तकलीफ हो रही है?",
            voice_prompt="What brings you here today? You can choose a symptom or tell us in your own words.",
            voice_prompt_hi="आज आपको क्या परेशानी है? आप बोलकर भी बता सकते हैं।",
            step_label="Start",
            answer_type="CHOICE",
            options=[
                QuestionOption(id="CHEST_PAIN", label="Chest Pain", label_hi="सीने में दर्द", icon="heart-pulse"),
                QuestionOption(id="FEVER", label="Fever", label_hi="बुखार", icon="thermometer"),
                QuestionOption(id="COUGH", label="Cough", label_hi="खांसी", icon="wind"),
                QuestionOption(id="STOMACH_PAIN", label="Stomach Pain", label_hi="पेट में दर्द", icon="activity"),
                QuestionOption(id="ROUTINE_CHECKUP", label="Routine Health Check-up", label_hi="नियमित स्वास्थ्य जांच", icon="clipboard-check"),
                QuestionOption(id="SOMETHING_ELSE", label="Something else", label_hi="कुछ और परेशानी", icon="help-circle"),
            ],
            allow_voice=True,
            allow_text=True,
        )

    @classmethod
    def select_branch(cls, answer: str) -> str:
        """Map user selection or natural language into an available branch."""
        clean = answer.strip().upper()
        if clean in cls.BRANCHES:
            return clean

        text_lower = answer.lower()
        if "chest" in text_lower or "heart" in text_lower or "seene" in text_lower:
            return "CHEST_PAIN"
        elif "fever" in text_lower or "bukhar" in text_lower or "temp" in text_lower:
            return "FEVER"
        elif "cough" in text_lower or "khansi" in text_lower or "phlegm" in text_lower:
            return "COUGH"
        elif "stomach" in text_lower or "pet" in text_lower or "abdomen" in text_lower:
            return "STOMACH_PAIN"
        elif "routine" in text_lower or "checkup" in text_lower or "refill" in text_lower:
            return "ROUTINE_CHECKUP"

        # Default fallback
        return "ROUTINE_CHECKUP"

    @classmethod
    def process_answer(
        cls,
        branch: str,
        current_question_id: str,
        raw_answer: str,
        collected_answers: Dict[str, Any],
        patient_context: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, Dict[str, Any], Optional[QuestionDTO], bool, Optional[str], Optional[str]]:
        """
        Process answer, run red-flag checks, and return:
        (new_branch, updated_answers, next_question_or_none, is_urgent, rule_name, advisory_message)
        """
        # 1. Handle START question (branch selection)
        if current_question_id == "START":
            selected_branch = cls.select_branch(raw_answer)
            branch_instance = cls.BRANCHES[selected_branch]
            first_q = branch_instance.get_first_question(patient_context)
            return (selected_branch, {}, first_q, False, None, None)

        # 2. Normalize answer
        normalized = ClinicalInterpretationProvider.normalize_answer(current_question_id, raw_answer)
        updated_answers = dict(collected_answers)
        updated_answers[current_question_id] = normalized

        # 3. Deterministic Red-Flag Safety Check
        is_urgent, rule_name, advisory = RedFlagSafetyEngine.evaluate(branch, updated_answers)
        if is_urgent:
            return (branch, updated_answers, None, True, rule_name, advisory)

        # 4. Determine Next Question in Branch
        branch_instance = cls.BRANCHES.get(branch)
        if not branch_instance:
            return (branch, updated_answers, None, False, None, None)

        next_q = branch_instance.get_next_question(current_question_id, updated_answers, patient_context)
        return (branch, updated_answers, next_q, False, None, None)
