"""Base class for question branches."""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from backend.app.interview.state import QuestionDTO, QuestionOption


class QuestionBranch(ABC):
    """Abstract class for clinical question branches."""

    @property
    @abstractmethod
    def branch_name(self) -> str:
        pass

    @property
    @abstractmethod
    def chief_complaint(self) -> str:
        pass

    @abstractmethod
    def get_first_question(self, patient_context: Optional[Dict[str, Any]] = None) -> QuestionDTO:
        pass

    @abstractmethod
    def get_next_question(
        self,
        current_question_id: str,
        answers: Dict[str, Any],
        patient_context: Optional[Dict[str, Any]] = None
    ) -> Optional[QuestionDTO]:
        """Return next question, or None if branch has gathered enough information."""
        pass
