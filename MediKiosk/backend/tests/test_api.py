"""Automated tests for MediKiosk Backend API."""
import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/")
        assert res.status_code == 200
        data = res.json()
        assert data["app"] == "MEDIKIOSK"
        assert data["status"] == "online"


@pytest.mark.asyncio
async def test_otp_request_and_verification():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Request OTP for demo patient mobile
        req_res = await ac.post("/api/v1/auth/request-otp", json={
            "identity_type": "MOBILE",
            "identifier": "+91 98765 43210"
        })
        assert req_res.status_code == 200
        req_data = req_res.json()
        assert "challenge_id" in req_data
        assert "123456" in req_data["demo_hint"]

        # 2. Verify OTP with correct mock OTP 123456
        verify_res = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE",
            "identifier": "+91 98765 43210",
            "otp": "123456"
        })
        assert verify_res.status_code == 200
        auth_data = verify_res.json()
        assert "access_token" in auth_data
        assert auth_data["user"]["role"] == "PATIENT"
        token = auth_data["access_token"]

        # 3. Test /auth/me with bearer token
        headers = {"Authorization": f"Bearer {token}"}
        me_res = await ac.get("/api/v1/auth/me", headers=headers)
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["patient_profile"]["full_name"] == "Ramesh Kumar"


@pytest.mark.asyncio
async def test_doctor_lookup_patient_by_identifier():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Login as Dr. Sharma
        v_res = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE",
            "identifier": "+91 98765 00001",
            "otp": "123456"
        })
        assert v_res.status_code == 200
        token = v_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Search for Ramesh Kumar by Mobile Number (NO MediKiosk ID)
        search_res = await ac.post("/api/v1/doctor/patients/search", json={
            "identifier": "9876543210"
        }, headers=headers)
        assert search_res.status_code == 200
        search_data = search_res.json()
        assert search_data["found"] is True
        assert search_data["patient"]["full_name"] == "Ramesh Kumar"


@pytest.mark.asyncio
async def test_user_preferences_and_reset_demo():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Login
        v_res = await ac.post("/api/v1/auth/verify-otp", json={
            "identity_type": "MOBILE",
            "identifier": "+91 98765 43210",
            "otp": "123456"
        })
        token = v_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Update language to Hindi
        put_res = await ac.put("/api/v1/preferences", json={
            "language": "hi",
            "text_size": "large"
        }, headers=headers)
        assert put_res.status_code == 200
        assert put_res.json()["language"] == "hi"

        # Test demo reset
        reset_res = await ac.post("/api/v1/dev/reset-demo")
        assert reset_res.status_code == 200
