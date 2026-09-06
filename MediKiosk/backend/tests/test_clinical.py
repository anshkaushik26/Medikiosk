"""Tests for Phase 2: Patient Health Record, Medical Timeline, and Patient Isolation."""
import io
import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app


@pytest.mark.asyncio
async def test_health_record_and_summary_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Authenticate as Ramesh Kumar
        auth_res = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE",
            "identifier": "+91 98765 43210",
            "otp": "123456",
        })
        assert auth_res.status_code == 200
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get health summary
        summary_res = await ac.get("/api/v1/patient/summary", headers=headers)
        assert summary_res.status_code == 200
        summary_data = summary_res.json()
        assert summary_data["conditions_count"] >= 2
        assert summary_data["medications_count"] >= 3
        assert summary_data["allergies_count"] >= 2
        assert summary_data["completeness_percent"] > 50

        # 3. Get full aggregated health record
        health_res = await ac.get("/api/v1/patient/health", headers=headers)
        assert health_res.status_code == 200
        health_data = health_res.json()
        assert "summary" in health_data
        assert len(health_data["conditions"]) >= 2
        assert len(health_data["medications"]) >= 3
        assert len(health_data["allergies"]) >= 2


@pytest.mark.asyncio
async def test_clinical_crud_and_timeline():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Auth Ramesh
        auth_res = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE",
            "identifier": "+91 98765 43210",
            "otp": "123456",
        })
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Condition CRUD
        new_cond = await ac.post("/api/v1/patient/conditions", json={
            "condition_name": "Mild Asthma",
            "diagnosis_date": "2022",
            "status": "Active",
            "notes": "Triggered by cold weather",
        }, headers=headers)
        assert new_cond.status_code == 200
        cond_id = new_cond.json()["id"]

        update_cond = await ac.put(f"/api/v1/patient/conditions/{cond_id}", json={
            "status": "Resolved",
        }, headers=headers)
        assert update_cond.status_code == 200
        assert update_cond.json()["status"] == "Resolved"

        # Medication CRUD
        new_med = await ac.post("/api/v1/patient/medicines", json={
            "medicine_name": "Inhaler Levosalbutamol",
            "dose": "50 mcg",
            "frequency": "As needed",
            "purpose": "Asthma relief",
            "status": "Currently taking",
        }, headers=headers)
        assert new_med.status_code == 200
        med_id = new_med.json()["id"]

        stop_med = await ac.put(f"/api/v1/patient/medicines/{med_id}", json={
            "status": "Stopped",
        }, headers=headers)
        assert stop_med.status_code == 200
        assert stop_med.json()["status"] == "Stopped"

        # Allergy CRUD
        new_alg = await ac.post("/api/v1/patient/allergies", json={
            "allergen": "Dust Mites",
            "reaction": "Sneezing & watery eyes",
            "severity": "Mild",
        }, headers=headers)
        assert new_alg.status_code == 200
        alg_id = new_alg.json()["id"]

        # Family History CRUD
        new_fam = await ac.post("/api/v1/patient/family", json={
            "relation": "Brother",
            "condition": "High Cholesterol",
            "age_at_diagnosis": "45",
        }, headers=headers)
        assert new_fam.status_code == 200
        fam_id = new_fam.json()["id"]

        # Surgery CRUD
        new_surg = await ac.post("/api/v1/patient/surgeries", json={
            "procedure_name": "Cataract Surgery (Right Eye)",
            "surgery_date": "10 Mar 2024",
            "hospital": "Eye Care Hospital",
        }, headers=headers)
        assert new_surg.status_code == 200
        surg_id = new_surg.json()["id"]

        # Document Upload
        file_content = b"Sample Medical Lab Report Content for test"
        files = {"file": ("test_report.txt", io.BytesIO(file_content), "text/plain")}
        data = {
            "document_type": "lab_report",
            "document_date": "20 Aug 2026",
            "hospital_name": "Test Diagnostics",
            "patient_notes": "Test note",
        }
        upload_res = await ac.post("/api/v1/patient/documents/upload", files=files, data=data, headers=headers)
        assert upload_res.status_code == 200
        doc_id = upload_res.json()["id"]
        storage_key = upload_res.json()["storage_key"]

        # File Retrieval
        file_res = await ac.get(f"/api/v1/patient/documents/file/{storage_key}", headers=headers)
        assert file_res.status_code == 200
        assert file_res.content == file_content

        # Timeline verification
        timeline_res = await ac.get("/api/v1/patient/timeline", headers=headers)
        assert timeline_res.status_code == 200
        events = timeline_res.json()
        assert len(events) >= 5
        event_types = [e["event_type"] for e in events]
        assert "CONDITION" in event_types
        assert "MEDICATION" in event_types
        assert "REPORT" in event_types

        # Clean up created items
        await ac.delete(f"/api/v1/patient/conditions/{cond_id}", headers=headers)
        await ac.delete(f"/api/v1/patient/medicines/{med_id}", headers=headers)
        await ac.delete(f"/api/v1/patient/allergies/{alg_id}", headers=headers)
        await ac.delete(f"/api/v1/patient/family/{fam_id}", headers=headers)
        await ac.delete(f"/api/v1/patient/surgeries/{surg_id}", headers=headers)
        await ac.delete(f"/api/v1/patient/documents/{doc_id}", headers=headers)


@pytest.mark.asyncio
async def test_patient_isolation_security():
    """Security verification: Patient A cannot access or mutate Patient B's records."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Login Patient A (Ramesh)
        res_a = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE",
            "identifier": "+91 98765 43210",
            "otp": "123456",
        })
        token_a = res_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # 2. Login Patient B (New patient)
        res_b = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE",
            "identifier": "+91 99999 88888",
            "otp": "123456",
        })
        token_b = res_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # Patient A creates a condition
        create_res = await ac.post("/api/v1/patient/conditions", json={
            "condition_name": "Private Condition A",
            "status": "Active",
        }, headers=headers_a)
        cond_a_id = create_res.json()["id"]

        # Patient B attempts to update Patient A's condition -> MUST return 404
        malicious_update = await ac.put(f"/api/v1/patient/conditions/{cond_a_id}", json={
            "condition_name": "Hacked",
        }, headers=headers_b)
        assert malicious_update.status_code == 404

        # Patient B attempts to delete Patient A's condition -> MUST return 404
        malicious_delete = await ac.delete(f"/api/v1/patient/conditions/{cond_a_id}", headers=headers_b)
        assert malicious_delete.status_code == 404

        # Clean up
        await ac.delete(f"/api/v1/patient/conditions/{cond_a_id}", headers=headers_a)
