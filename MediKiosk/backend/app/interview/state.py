"""Data models for question representation and state transitions."""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class QuestionOption(BaseModel):
    id: str
    label: str
    label_hi: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None


class QuestionDTO(BaseModel):
    id: str
    branch: str
    text: str
    text_hi: Optional[str] = None
    voice_prompt: Optional[str] = None
    voice_prompt_hi: Optional[str] = None
    help_text: Optional[str] = None
    help_text_hi: Optional[str] = None
    step_label: str = "Step"
    answer_type: str = "CHOICE"  # CHOICE, MULTIPLE_CHOICE, SCALE, TEXT, RECORD_CONFIRM
    options: List[QuestionOption] = []
    required: bool = True
    allow_voice: bool = True
    allow_text: bool = True
    placeholder: Optional[str] = None


class InterviewStateDTO(BaseModel):
    interview_id: str
    status: str
    safety_status: str
    branch: str
    current_question: Optional[QuestionDTO] = None
    completed_questions_count: int = 0
    total_estimated_steps: int = 6
    progress_percentage: int = 0
    chief_complaint: Optional[str] = None
    urgent_alert: Optional[Dict[str, Any]] = None
