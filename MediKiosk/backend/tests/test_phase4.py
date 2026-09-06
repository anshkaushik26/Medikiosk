"""Tests for MediKiosk Phase 4: Adaptive AI Health Interview, Voice, Red-Flag Safety, and Patient Verification."""
import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app


@pytest.mark.asyncio
async def test_start_interview_and_initial_question():
    """Verify starting an interview returns the friendly initial symptom question."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        auth_res = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE",
            "identifier": "+91 98765 43210",
            "otp": "123456",
        })
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        res = await ac.post("/api/v1/patient/interviews", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "IN_PROGRESS"
        assert data["safety_status"] == "NORMAL"
        assert data["current_question"] is not None
        assert data["current_question"]["id"] == "START"
        assert len(data["current_question"]["options"]) >= 5

        # Clean up / abandon
        await ac.post(f"/api/v1/patient/interviews/{data['interview_id']}/abandon", headers=headers)


@pytest.mark.asyncio
async def test_chest_pain_red_flag_interruption():
    """Verify chest pain + difficulty breathing triggers immediate deterministic red-flag interruption."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        auth_res = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE",
            "identifier": "+91 98765 43210",
            "otp": "123456",
        })
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Start interview
        init_res = await ac.post("/api/v1/patient/interviews", headers=headers)
        int_id = init_res.json()["interview_id"]

        # 2. Answer START -> Chest Pain
        ans_res = await ac.post(f"/api/v1/patient/interviews/{int_id}/answer", json={
            "question_id": "START",
            "question_text": "What is bothering you today?",
            "answer_text": "CHEST_PAIN",
            "answer_type": "CHOICE",
            "source": "TOUCH",
        }, headers=headers)
        assert ans_res.status_code == 200
        assert ans_res.json()["branch"] == "CHEST_PAIN"
        assert ans_res.json()["current_question"]["id"] == "CP_ONSET"

        # 3. Answer CP_ONSET
        ans_res = await ac.post(f"/api/v1/patient/interviews/{int_id}/answer", json={
            "question_id": "CP_ONSET",
            "question_text": "When did the chest pain start?",
            "answer_text": "TODAY",
            "answer_type": "CHOICE",
            "source": "TOUCH",
        }, headers=headers)
        assert ans_res.json()["current_question"]["id"] == "CP_LOCATION"

        # 4. Answer CP_LOCATION
        ans_res = await ac.post(f"/api/v1/patient/interviews/{int_id}/answer", json={
            "question_id": "CP_LOCATION",
            "question_text": "Where do you feel the pain?",
            "answer_text": "CENTER",
            "answer_type": "CHOICE",
            "source": "TOUCH",
        }, headers=headers)
        assert ans_res.json()["current_question"]["id"] == "CP_CHARACTER"

        # 5. Answer CP_CHARACTER
        ans_res = await ac.post(f"/api/v1/patient/interviews/{int_id}/answer", json={
            "question_id": "CP_CHARACTER",
            "question_text": "What does the pain feel like?",
            "answer_text": "PRESSURE",
            "answer_type": "CHOICE",
            "source": "TOUCH",
        }, headers=headers)
        assert ans_res.json()["current_question"]["id"] == "CP_SEVERITY"

        # 6. Answer CP_SEVERITY
        ans_res = await ac.post(f"/api/v1/patient/interviews/{int_id}/answer", json={
            "question_id": "CP_SEVERITY",
            "question_text": "How strong is the pain?",
            "answer_text": "MODERATE",
            "answer_type": "SCALE",
            "source": "TOUCH",
        }, headers=headers)
        assert ans_res.json()["current_question"]["id"] == "CP_RADIATION"

        # 7. Answer CP_RADIATION
        ans_res = await ac.post(f"/api/v1/patient/interviews/{int_id}/answer", json={
            "question_id": "CP_RADIATION",
            "question_text": "Does the pain move to your arm or jaw?",
            "answer_text": "YES_ARM",
            "answer_type": "CHOICE",
            "source": "TOUCH",
        }, headers=headers)
        assert ans_res.json()["current_question"]["id"] == "CP_BREATHING"

        # 8. Answer CP_BREATHING -> YES (Trigger Red Flag!)
        urgent_res = await ac.post(f"/api/v1/patient/interviews/{int_id}/answer", json={
            "question_id": "CP_BREATHING",
            "question_text": "Are you having trouble breathing?",
            "answer_text": "YES",
            "answer_type": "CHOICE",
            "source": "TOUCH",
        }, headers=headers)

        data = urgent_res.json()
        assert data["status"] == "URGENT"
        assert data["safety_status"] == "URGENT_RED_FLAG"
        assert data["current_question"] is None  # Stopped normal questioning
        assert data["urgent_alert"] is not None
        assert data["urgent_alert"]["triggered_rule"] == "CHEST_PAIN_WITH_DYSPNEA"

        # Clean up
        await ac.post(f"/api/v1/patient/interviews/{int_id}/abandon", headers=headers)


@pytest.mark.asyncio
async def test_non_urgent_flow_edit_and_confirm():
    """Verify non-urgent interview completes to REVIEW, allows editing, and confirmation updates timeline."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        auth_res = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE",
            "identifier": "+91 98765 43210",
            "otp": "123456",
        })
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Start interview
        init_res = await ac.post("/api/v1/patient/interviews", headers=headers)
        int_id = init_res.json()["interview_id"]

        # Step through non-urgent chest pain
        steps = [
            ("START", "CHEST_PAIN"),
            ("CP_ONSET", "FEW_DAYS"),
            ("CP_LOCATION", "RIGHT"),
            ("CP_CHARACTER", "DULL"),
            ("CP_SEVERITY", "MILD"),
            ("CP_RADIATION", "NO"),
            ("CP_BREATHING", "NO"),
            ("CP_SWEATING", "NO"),
        ]

        for q_id, val in steps:
            step_res = await ac.post(f"/api/v1/patient/interviews/{int_id}/answer", json={
                "question_id": q_id,
                "question_text": f"Question {q_id}",
                "answer_text": val,
                "answer_type": "CHOICE",
                "source": "TOUCH",
            }, headers=headers)

        # Should reach REVIEW state
        rev_data = step_res.json()
        assert rev_data["status"] == "REVIEW"
        assert rev_data["safety_status"] == "NORMAL"
        assert rev_data["summary"] is not None
        assert "history_of_present_illness" in rev_data["summary"]

        # Patient edits an answer
        past_interviews = await ac.get("/api/v1/patient/interviews", headers=headers)
        curr_int = next(i for i in past_interviews.json() if i["id"] == int_id)
        first_ans = curr_int["answers"][0]

        edit_res = await ac.put(
            f"/api/v1/patient/interviews/{int_id}/answers/{first_ans['id']}",
            json={"answer_text": "Updated answer during review"},
            headers=headers
        )
        assert edit_res.status_code == 200

        # Patient confirms interview
        conf_res = await ac.post(
            f"/api/v1/patient/interviews/{int_id}/confirm",
            json={"save_to_health_record": True},
            headers=headers
        )
        assert conf_res.status_code == 200
        assert conf_res.json()["status"] == "success"

        # Verify TimelineEvent created
        timeline_res = await ac.get("/api/v1/patient/timeline", headers=headers)
        assert timeline_res.status_code == 200
        events = timeline_res.json()
        int_event = next((e for e in events if e.get("source_id") == int_id), None)
        assert int_event is not None
        assert "Health Interview" in int_event["title"]


@pytest.mark.asyncio
async def test_routine_checkup_reuses_existing_records():
    """Verify routine check-up branch personalizes questions using Ramesh's existing Diabetes record."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        auth_res = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE",
            "identifier": "+91 98765 43210",
            "otp": "123456",
        })
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Start interview
        init_res = await ac.post("/api/v1/patient/interviews", headers=headers)
        int_id = init_res.json()["interview_id"]

        # Select ROUTINE_CHECKUP
        step1 = await ac.post(f"/api/v1/patient/interviews/{int_id}/answer", json={
            "question_id": "START",
            "question_text": "What is bothering you today?",
            "answer_text": "ROUTINE_CHECKUP",
            "answer_type": "CHOICE",
            "source": "TOUCH",
        }, headers=headers)
        assert step1.json()["current_question"]["id"] == "RC_REASON"

        # Answer RC_REASON
        step2 = await ac.post(f"/api/v1/patient/interviews/{int_id}/answer", json={
            "question_id": "RC_REASON",
            "question_text": "Reason for visit?",
            "answer_text": "GENERAL",
            "answer_type": "CHOICE",
            "source": "TOUCH",
        }, headers=headers)

        # Next question MUST incorporate existing conditions (Diabetes / Hypertension)
        next_q = step2.json()["current_question"]
        assert next_q["id"] == "RC_CONFIRM_CONDITIONS"
        assert "Diabetes" in next_q["text"]

        # Clean up
        await ac.post(f"/api/v1/patient/interviews/{int_id}/abandon", headers=headers)


@pytest.mark.asyncio
async def test_cough_and_fever_red_flags():
    """Verify cough with hemoptysis and fever with severe dyspnea trigger red flags."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        auth_res = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE",
            "identifier": "+91 98765 43210",
            "otp": "123456",
        })
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Start interview for Cough
        init_res = await ac.post("/api/v1/patient/interviews", headers=headers)
        int_id = init_res.json()["interview_id"]

        await ac.post(f"/api/v1/patient/interviews/{int_id}/answer", json={
            "question_id": "START", "question_text": "Complaint?", "answer_text": "COUGH",
            "answer_type": "CHOICE", "source": "TOUCH"
        }, headers=headers)

        await ac.post(f"/api/v1/patient/interviews/{int_id}/answer", json={
            "question_id": "COUGH_DURATION", "question_text": "Duration?", "answer_text": "FEW_DAYS",
            "answer_type": "CHOICE", "source": "TOUCH"
        }, headers=headers)

        await ac.post(f"/api/v1/patient/interviews/{int_id}/answer", json={
            "question_id": "COUGH_TYPE", "question_text": "Type?", "answer_text": "WET",
            "answer_type": "CHOICE", "source": "TOUCH"
        }, headers=headers)

        # Cough with Blood -> YES
        blood_res = await ac.post(f"/api/v1/patient/interviews/{int_id}/answer", json={
            "question_id": "COUGH_BLOOD", "question_text": "Blood?", "answer_text": "YES",
            "answer_type": "CHOICE", "source": "TOUCH"
        }, headers=headers)

        data = blood_res.json()
        assert data["status"] == "URGENT"
        assert data["urgent_alert"]["triggered_rule"] == "COUGH_WITH_HEMOPTYSIS"

        # Clean up
        await ac.post(f"/api/v1/patient/interviews/{int_id}/abandon", headers=headers)


@pytest.mark.asyncio
async def test_patient_cross_tenant_interview_isolation():
    """Security verification: Patient B cannot access, answer, or confirm Patient A's interview."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Patient A (Ramesh)
        res_a = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE", "identifier": "+91 98765 43210", "otp": "123456"
        })
        headers_a = {"Authorization": f"Bearer {res_a.json()['access_token']}"}

        # Patient B
        res_b = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE", "identifier": "+91 99999 88888", "otp": "123456"
        })
        headers_b = {"Authorization": f"Bearer {res_b.json()['access_token']}"}

        # Patient A creates an interview
        init_a = await ac.post("/api/v1/patient/interviews", headers=headers_a)
        int_a_id = init_a.json()["interview_id"]

        # Patient B tries to get Patient A's interview state -> 404
        b_get = await ac.get(f"/api/v1/patient/interviews/{int_a_id}", headers=headers_b)
        assert b_get.status_code == 404

        # Patient B tries to answer Patient A's interview -> 404
        b_ans = await ac.post(f"/api/v1/patient/interviews/{int_a_id}/answer", json={
            "question_id": "START", "question_text": "Q", "answer_text": "FEVER",
            "answer_type": "CHOICE", "source": "TOUCH"
        }, headers=headers_b)
        assert b_ans.status_code == 404

        # Patient B tries to confirm Patient A's interview -> 404
        b_conf = await ac.post(f"/api/v1/patient/interviews/{int_a_id}/confirm", headers=headers_b)
        assert b_conf.status_code == 404

        # Clean up
        await ac.post(f"/api/v1/patient/interviews/{int_a_id}/abandon", headers=headers_a)
