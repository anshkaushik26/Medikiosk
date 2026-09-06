"""Tests for MediKiosk Phase 3: Medical Document Intelligence, OCR & Structured Extraction."""
import io
import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app


@pytest.mark.asyncio
async def test_document_validation_and_rejection():
    """Verify document upload validation and friendly rejection of bad files."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Auth Ramesh
        auth_res = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE",
            "identifier": "+91 98765 43210",
            "otp": "123456",
        })
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Empty file upload -> should be rejected gracefully
        empty_files = {"file": ("empty.txt", io.BytesIO(b""), "text/plain")}
        res_empty = await ac.post(
            "/api/v1/patient/documents/upload",
            files=empty_files,
            data={"document_type": "prescription"},
            headers=headers
        )
        assert res_empty.status_code == 400
        assert "empty" in res_empty.json()["detail"].lower()


@pytest.mark.asyncio
async def test_document_intelligence_pipeline_and_extraction():
    """Test full pipeline: Upload -> Trigger Processing -> Status Check -> Review -> Edit -> Confirm -> Save."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        auth_res = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE",
            "identifier": "+91 98765 43210",
            "otp": "123456",
        })
        token = auth_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Upload a demo blood lab report
        lab_content = (
            b"CITY HEALTH CLINIC - LABORATORY SERVICES\n"
            b"Patient: Ramesh Kumar\n"
            b"HbA1c (Glycated Hemoglobin)   7.2   %   4.0 - 5.6\n"
            b"Fasting Blood Sugar (FBS)     142   mg/dL   70 - 100\n"
        )
        files = {"file": ("demo_lab_test_report.txt", io.BytesIO(lab_content), "text/plain")}
        upload_res = await ac.post(
            "/api/v1/patient/documents/upload",
            files=files,
            data={"document_type": "lab_report", "document_date": "14 Aug 2026", "hospital_name": "City Lab"},
            headers=headers
        )
        assert upload_res.status_code == 200
        doc_id = upload_res.json()["id"]

        # 2. Trigger Document Processing Job
        proc_res = await ac.post(f"/api/v1/patient/documents/{doc_id}/process", headers=headers)
        assert proc_res.status_code == 200
        assert proc_res.json()["document_id"] == doc_id

        # 3. Retrieve extraction with source coordinates
        ext_res = await ac.get(f"/api/v1/patient/documents/{doc_id}/extraction", headers=headers)
        assert ext_res.status_code == 200
        ext_data = ext_res.json()
        assert ext_data["extraction_status"] in ["NEEDS_REVIEW", "EXTRACTED", "PROCESSING"]
        assert len(ext_data["entities"]) > 0

        # Check source linking fields
        first_ent = ext_data["entities"][0]
        assert "source_text" in first_ent
        assert "bounding_box" in first_ent
        assert "confidence" in first_ent
        assert first_ent["bounding_box"] is not None
        assert "x" in first_ent["bounding_box"]
        assert "y" in first_ent["bounding_box"]

        # 4. Patient Edits an Extracted Entity (Patient Correction)
        lab_ent = next((e for e in ext_data["entities"] if e["entity_type"] == "LAB_RESULT"), ext_data["entities"][0])
        ent_id = lab_ent["id"]
        val = dict(lab_ent["entity_value"])
        val["value"] = "7.4"  # Corrected value
        edit_res = await ac.put(
            f"/api/v1/patient/documents/{doc_id}/extraction/{ent_id}",
            json={"entity_value": val},
            headers=headers
        )
        assert edit_res.status_code == 200
        assert edit_res.json()["patient_corrected"] is True
        assert edit_res.json()["verification_status"] == "PATIENT_CORRECTED"

        # 5. Patient Confirms/Verifies Entities (Save to Health Record)
        verify_res = await ac.post(
            f"/api/v1/patient/documents/{doc_id}/verify",
            json={"entity_ids": [ent_id], "duplicate_resolution": "ADD_NEW"},
            headers=headers
        )
        assert verify_res.status_code == 200
        assert verify_res.json()["confirmed_count"] >= 1

        # 6. Verify Lab Result was actually created and links back to document
        lab_res = await ac.get("/api/v1/patient/lab-results", headers=headers)
        assert lab_res.status_code == 200
        labs = lab_res.json()
        matching_lab = next((l for l in labs if l["document_id"] == doc_id), None)
        assert matching_lab is not None
        assert matching_lab["verification_status"] == "PATIENT_VERIFIED"
        assert matching_lab["source_page"] >= 1

        # 7. Verify Timeline was updated with source document reference
        timeline_res = await ac.get("/api/v1/patient/timeline", headers=headers)
        assert timeline_res.status_code == 200
        events = timeline_res.json()
        doc_events = [e for e in events if e.get("source_id") == doc_id]
        assert len(doc_events) > 0

        # Clean up
        await ac.delete(f"/api/v1/patient/documents/{doc_id}", headers=headers)


@pytest.mark.asyncio
async def test_patient_cross_tenant_document_isolation():
    """Security verification: Patient B cannot access, process, or verify Patient A's documents."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Patient A (Ramesh)
        res_a = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE",
            "identifier": "+91 98765 43210",
            "otp": "123456",
        })
        token_a = res_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # Patient B (New patient)
        res_b = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE",
            "identifier": "+91 99999 77777",
            "otp": "123456",
        })
        token_b = res_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # Patient A uploads a document
        files = {"file": ("private_patient_a_doc.txt", io.BytesIO(b"Private Medical Content"), "text/plain")}
        up_res = await ac.post(
            "/api/v1/patient/documents/upload",
            files=files,
            data={"document_type": "prescription"},
            headers=headers_a
        )
        doc_a_id = up_res.json()["id"]

        # Patient B tries to get processing status -> MUST return 404
        b_status = await ac.get(f"/api/v1/patient/documents/{doc_a_id}/processing-status", headers=headers_b)
        assert b_status.status_code == 404

        # Patient B tries to get extraction -> MUST return 404
        b_ext = await ac.get(f"/api/v1/patient/documents/{doc_a_id}/extraction", headers=headers_b)
        assert b_ext.status_code == 404

        # Patient B tries to verify extraction -> MUST return 404
        b_ver = await ac.post(f"/api/v1/patient/documents/{doc_a_id}/verify", json={"entity_ids": []}, headers=headers_b)
        assert b_ver.status_code == 404

        # Patient B tries to access file binary directly -> MUST return 404
        storage_key = up_res.json()["storage_key"]
        b_file = await ac.get(f"/api/v1/patient/documents/file/{storage_key}", headers=headers_b)
        assert b_file.status_code == 404

        # Clean up
        await ac.delete(f"/api/v1/patient/documents/{doc_a_id}", headers=headers_a)
