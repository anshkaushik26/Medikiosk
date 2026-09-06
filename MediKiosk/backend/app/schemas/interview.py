"""Pydantic schemas for Clinical Interviews."""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from backend.app.interview.state import QuestionDTO


class InterviewStartRequest(BaseModel):
    branch: Optional[str] = None


class InterviewAnswerRequest(BaseModel):
    question_id: str
    question_text: str
    answer_text: str
    answer_type: str = "CHOICE"
    source: str = "TOUCH"  # VOICE, TEXT, TOUCH, RECORD, DOCUMENT


class InterviewAnswerUpdate(BaseModel):
    answer_text: str


class InterviewAnswerOut(BaseModel):
    id: str
    interview_id: str
    question_id: str
    question_text: str
    answer_text: str
    normalized_value: Optional[Dict[str, Any]] = None
    answer_type: str
    source: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UrgentAlertOut(BaseModel):
    id: str
    patient_id: str
    interview_id: str
    triggered_rule: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ClinicalInterviewOut(BaseModel):
    id: str
    patient_id: str
    branch: str
    current_question_id: str
    status: str
    safety_status: str
    chief_complaint: Optional[str] = None
    summary: Optional[Dict[str, Any]] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime
    answers: List[InterviewAnswerOut] = []
    alerts: List[UrgentAlertOut] = []

    model_config = ConfigDict(from_attributes=True)


class InterviewStateResponse(BaseModel):
    interview_id: str
    status: str
    safety_status: str
    branch: str
    current_question: Optional[QuestionDTO] = None
    completed_questions_count: int = 0
    total_estimated_steps: int = 5
    progress_percentage: int = 0
    chief_complaint: Optional[str] = None
    urgent_alert: Optional[UrgentAlertOut] = None
    summary: Optional[Dict[str, Any]] = None


class InterviewConfirmRequest(BaseModel):
    save_to_health_record: bool = True
