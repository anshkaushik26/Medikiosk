"""API Router for MediKiosk Phase 4: Adaptive AI Health Interview."""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user_payload
from backend.app.services.interview_service import InterviewService
from backend.app.schemas.interview import (
    InterviewStartRequest,
    InterviewAnswerRequest,
    InterviewAnswerUpdate,
    InterviewStateResponse,
    ClinicalInterviewOut,
    InterviewConfirmRequest,
)

router = APIRouter(prefix="/patient/interviews", tags=["Health Interview"])


@router.post("", response_model=InterviewStateResponse)
async def start_or_resume_interview(
    data: Optional[InterviewStartRequest] = None,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Start a new clinical interview or resume an in-progress one."""
    branch = data.branch if data else None
    return await InterviewService.start_or_resume_interview(db, payload["sub"], branch)


@router.get("", response_model=List[ClinicalInterviewOut])
async def list_patient_interviews(
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """List historical and active health interviews for the authenticated patient."""
    return await InterviewService.list_interviews(db, payload["sub"])


@router.get("/{interview_id}", response_model=InterviewStateResponse)
async def get_interview_state(
    interview_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve the current interview state, active question, and safety status."""
    return await InterviewService.get_interview_state(db, payload["sub"], interview_id)


@router.post("/{interview_id}/answer", response_model=InterviewStateResponse)
async def submit_answer(
    interview_id: str,
    data: InterviewAnswerRequest,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Submit an answer to the current question, run red-flag checks, and advance."""
    return await InterviewService.submit_answer(db, payload["sub"], interview_id, data)


@router.put("/{interview_id}/answers/{answer_id}")
async def edit_answer(
    interview_id: str,
    answer_id: str,
    data: InterviewAnswerUpdate,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Allow patient to edit an answer during the review stage."""
    return await InterviewService.edit_answer(
        db, payload["sub"], interview_id, answer_id, data.answer_text
    )


@router.post("/{interview_id}/confirm")
async def confirm_interview(
    interview_id: str,
    data: Optional[InterviewConfirmRequest] = None,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Patient explicitly confirms the interview; updates health record and timeline."""
    save_rec = data.save_to_health_record if data else True
    return await InterviewService.confirm_interview(
        db, payload["sub"], interview_id, save_rec
    )


@router.post("/{interview_id}/abandon")
async def abandon_interview(
    interview_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: AsyncSession = Depends(get_db),
):
    """Abandon an in-progress interview."""
    return await InterviewService.abandon_interview(db, payload["sub"], interview_id)
