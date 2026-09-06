"""Interview service orchestrating question state transitions, safety, and health record integration."""
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from sqlalchemy import select, and_, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.patient import PatientProfile
from backend.app.models.clinical import (
    Condition, Medication, Allergy, LabResult, TimelineEvent
)
from backend.app.models.interview import (
    ClinicalInterview, InterviewAnswer, UrgentInterviewAlert
)
from backend.app.interview.engine import InterviewEngine
from backend.app.interview.state import QuestionDTO
from backend.app.interview.summary.provider import ClinicalSummaryProvider
from backend.app.schemas.interview import (
    InterviewAnswerRequest, InterviewStateResponse, UrgentAlertOut
)


class InterviewService:
    """Business logic for adaptive health interviews."""

    @classmethod
    async def _get_patient_profile(cls, db: AsyncSession, user_id: str) -> PatientProfile:
        stmt = select(PatientProfile).where(PatientProfile.user_id == user_id)
        res = await db.execute(stmt)
        profile = res.scalars().first()
        if not profile:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        return profile

    @classmethod
    async def _get_patient_context(cls, db: AsyncSession, patient_id: str) -> Dict[str, Any]:
        """Fetch patient's conditions, medications, allergies, and lab results for question injection."""
        cond_stmt = select(Condition).where(Condition.patient_id == patient_id)
        conds = (await db.execute(cond_stmt)).scalars().all()

        med_stmt = select(Medication).where(Medication.patient_id == patient_id)
        meds = (await db.execute(med_stmt)).scalars().all()

        alg_stmt = select(Allergy).where(Allergy.patient_id == patient_id)
        algs = (await db.execute(alg_stmt)).scalars().all()

        lab_stmt = select(LabResult).where(LabResult.patient_id == patient_id).order_by(desc(LabResult.created_at))
        labs = (await db.execute(lab_stmt)).scalars().all()

        return {
            "conditions": [{"condition_name": c.condition_name, "status": c.status} for c in conds],
            "medications": [{"medicine_name": m.medicine_name, "dose": m.dose} for m in meds],
            "allergies": [{"allergen": a.allergen, "severity": a.severity} for a in algs],
            "lab_results": [{"test_name": l.test_name, "value": l.value, "unit": l.unit} for l in labs],
        }

    @classmethod
    async def _get_authorized_interview(
        cls, db: AsyncSession, user_id: str, interview_id: str
    ) -> ClinicalInterview:
        profile = await cls._get_patient_profile(db, user_id)
        stmt = (
            select(ClinicalInterview)
            .where(
                and_(ClinicalInterview.id == interview_id, ClinicalInterview.patient_id == profile.id)
            )
            .options(
                selectinload(ClinicalInterview.answers),
                selectinload(ClinicalInterview.alerts)
            )
        )
        res = await db.execute(stmt)
        interview = res.scalars().first()
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found or unauthorized")
        return interview

    @classmethod
    async def start_or_resume_interview(
        cls, db: AsyncSession, user_id: str, branch: Optional[str] = None
    ) -> InterviewStateResponse:
        """Start a new health interview or resume an in-progress one."""
        profile = await cls._get_patient_profile(db, user_id)

        # Check for active in-progress interview
        stmt = (
            select(ClinicalInterview)
            .where(
                and_(
                    ClinicalInterview.patient_id == profile.id,
                    ClinicalInterview.status.in_(["IN_PROGRESS", "REVIEW"])
                )
            )
            .options(
                selectinload(ClinicalInterview.answers),
                selectinload(ClinicalInterview.alerts)
            )
            .order_by(desc(ClinicalInterview.created_at))
        )
        existing = (await db.execute(stmt)).scalars().first()
        if existing:
            return await cls.get_interview_state(db, user_id, existing.id)

        # Create new interview
        initial_branch = branch or "GENERAL"
        new_interview = ClinicalInterview(
            id=str(uuid.uuid4()),
            patient_id=profile.id,
            branch=initial_branch,
            current_question_id="START",
            status="IN_PROGRESS",
            safety_status="NORMAL",
            chief_complaint="Pending chief complaint",
        )
        db.add(new_interview)
        await db.commit()
        await db.refresh(new_interview)

        return await cls.get_interview_state(db, user_id, new_interview.id)

    @classmethod
    async def get_interview_state(
        cls, db: AsyncSession, user_id: str, interview_id: str
    ) -> InterviewStateResponse:
        """Resolve the active question object and calculate progress."""
        interview = await cls._get_authorized_interview(db, user_id, interview_id)
        profile = await cls._get_patient_profile(db, user_id)
        patient_ctx = await cls._get_patient_context(db, profile.id)

        current_q: Optional[QuestionDTO] = None
        if interview.status == "IN_PROGRESS":
            if interview.current_question_id == "START":
                current_q = InterviewEngine.get_initial_question()
            else:
                branch_obj = InterviewEngine.BRANCHES.get(interview.branch)
                if branch_obj:
                    current_q = branch_obj.get_question_by_id(interview.current_question_id, patient_ctx)

        # Safety alert if urgent
        urgent_alert_dto: Optional[UrgentAlertOut] = None
        alert_stmt = select(UrgentInterviewAlert).where(UrgentInterviewAlert.interview_id == interview.id).order_by(desc(UrgentInterviewAlert.created_at))
        latest_alert = (await db.execute(alert_stmt)).scalars().first()
        if latest_alert:
            urgent_alert_dto = UrgentAlertOut.model_validate(latest_alert)

        completed_count = len(interview.answers)
        estimated_total = 5
        progress_pct = min(100, int((completed_count / estimated_total) * 100))

        return InterviewStateResponse(
            interview_id=interview.id,
            status=interview.status,
            safety_status=interview.safety_status,
            branch=interview.branch,
            current_question=current_q,
            completed_questions_count=completed_count,
            total_estimated_steps=estimated_total,
            progress_percentage=progress_pct,
            chief_complaint=interview.chief_complaint,
            urgent_alert=urgent_alert_dto,
            summary=interview.summary,
        )

    @classmethod
    async def submit_answer(
        cls,
        db: AsyncSession,
        user_id: str,
        interview_id: str,
        answer_req: InterviewAnswerRequest
    ) -> InterviewStateResponse:
        """Record patient answer, evaluate red-flag safety, and advance question tree."""
        interview = await cls._get_authorized_interview(db, user_id, interview_id)
        profile = await cls._get_patient_profile(db, user_id)
        patient_ctx = await cls._get_patient_context(db, profile.id)

        # Gather existing answers map
        answers_map = {a.question_id: a.normalized_value or a.answer_text for a in interview.answers}

        # Process through InterviewEngine
        new_branch, updated_answers, next_q, is_urgent, rule_name, advisory = InterviewEngine.process_answer(
            branch=interview.branch,
            current_question_id=answer_req.question_id,
            raw_answer=answer_req.answer_text,
            collected_answers=answers_map,
            patient_context=patient_ctx
        )

        # Save answer to database
        new_answer = InterviewAnswer(
            id=str(uuid.uuid4()),
            interview_id=interview.id,
            question_id=answer_req.question_id,
            question_text=answer_req.question_text,
            answer_text=answer_req.answer_text,
            normalized_value=updated_answers.get(answer_req.question_id),
            answer_type=answer_req.answer_type,
            source=answer_req.source,
        )
        db.add(new_answer)

        # Update interview fields
        interview.branch = new_branch
        if answer_req.question_id == "START":
            branch_instance = InterviewEngine.BRANCHES.get(new_branch)
            interview.chief_complaint = branch_instance.chief_complaint if branch_instance else answer_req.answer_text

        # If red-flag triggered -> URGENT interrupt
        if is_urgent:
            interview.safety_status = "URGENT_RED_FLAG"
            interview.status = "URGENT"
            interview.current_question_id = "URGENT_INTERRUPT"

            alert = UrgentInterviewAlert(
                id=str(uuid.uuid4()),
                patient_id=profile.id,
                interview_id=interview.id,
                triggered_rule=rule_name or "RED_FLAG_SAFETY_INTERRUPT",
                status="NEW",
            )
            db.add(alert)
            await db.commit()
            return await cls.get_interview_state(db, user_id, interview.id)

        # If no more questions -> transition to REVIEW
        if next_q is None:
            interview.status = "REVIEW"
            interview.current_question_id = "COMPLETED"
            summary_dict = ClinicalSummaryProvider.generate_summary(
                branch=new_branch,
                chief_complaint=interview.chief_complaint or "Medical Complaint",
                answers=updated_answers,
                patient_context=patient_ctx
            )
            interview.summary = summary_dict
        else:
            interview.current_question_id = next_q.id

        await db.commit()
        return await cls.get_interview_state(db, user_id, interview.id)

    @classmethod
    async def edit_answer(
        cls,
        db: AsyncSession,
        user_id: str,
        interview_id: str,
        answer_id: str,
        new_answer_text: str
    ) -> ClinicalInterview:
        """Allow patient to correct/edit an answer on the review screen."""
        interview = await cls._get_authorized_interview(db, user_id, interview_id)
        profile = await cls._get_patient_profile(db, user_id)
        patient_ctx = await cls._get_patient_context(db, profile.id)

        stmt = select(InterviewAnswer).where(
            and_(InterviewAnswer.id == answer_id, InterviewAnswer.interview_id == interview.id)
        )
        res = await db.execute(stmt)
        answer = res.scalars().first()
        if not answer:
            raise HTTPException(status_code=404, detail="Answer not found")

        answer.answer_text = new_answer_text
        # Re-generate summary
        answers_map = {a.question_id: a.normalized_value or a.answer_text for a in interview.answers}
        answers_map[answer.question_id] = {"raw": new_answer_text}

        interview.summary = ClinicalSummaryProvider.generate_summary(
            branch=interview.branch,
            chief_complaint=interview.chief_complaint or "Medical Complaint",
            answers=answers_map,
            patient_context=patient_ctx
        )
        await db.commit()
        return interview

    @classmethod
    async def confirm_interview(
        cls,
        db: AsyncSession,
        user_id: str,
        interview_id: str,
        save_to_health_record: bool = True
    ) -> Dict[str, Any]:
        """Patient explicitly confirms the interview. Adds timeline event and updates records."""
        interview = await cls._get_authorized_interview(db, user_id, interview_id)
        profile = await cls._get_patient_profile(db, user_id)

        interview.status = "CONFIRMED"
        interview.completed_at = datetime.now(timezone.utc)

        # Create TimelineEvent linking to interview
        complaint = interview.chief_complaint or "Health Interview"
        t_event = TimelineEvent(
            id=str(uuid.uuid4()),
            patient_id=profile.id,
            event_type="INTERVIEW",
            event_date=datetime.now(timezone.utc).strftime("%d %b %Y"),
            title=f"Health Interview: {complaint}",
            description=f"Completed clinical health interview for {complaint}. Verified by patient.",
            source_type="INTERVIEW",
            source_id=interview.id,
        )
        db.add(t_event)
        await db.commit()

        return {
            "status": "success",
            "message": "Health interview confirmed and saved to your health record.",
            "interview_id": interview.id,
        }

    @classmethod
    async def abandon_interview(
        cls, db: AsyncSession, user_id: str, interview_id: str
    ) -> Dict[str, Any]:
        interview = await cls._get_authorized_interview(db, user_id, interview_id)
        interview.status = "ABANDONED"
        await db.commit()
        return {"status": "success", "message": "Interview abandoned."}

    @classmethod
    async def list_interviews(
        cls, db: AsyncSession, user_id: str
    ) -> List[ClinicalInterview]:
        profile = await cls._get_patient_profile(db, user_id)
        stmt = (
            select(ClinicalInterview)
            .where(ClinicalInterview.patient_id == profile.id)
            .options(
                selectinload(ClinicalInterview.answers),
                selectinload(ClinicalInterview.alerts)
            )
            .order_by(desc(ClinicalInterview.created_at))
        )
        res = await db.execute(stmt)
        return res.scalars().all()
