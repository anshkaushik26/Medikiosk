"""Aadhaar Identity Provider Adapter."""
import uuid
from backend.app.core.config import settings
from backend.app.integrations.identity.base import IdentityProvider, VerificationChallenge, VerificationResult


class AadhaarProvider(IdentityProvider):
    """Adapter for Aadhaar verification (mock for UIDAI OTP / demographic gateway)."""

    async def initiate_verification(self, identifier: str) -> VerificationChallenge:
        clean_id = identifier.strip().replace(" ", "").replace("-", "")
        masked_id = f"XXXX-XXXX-{clean_id[-4:]}" if len(clean_id) >= 4 else clean_id
        return VerificationChallenge(
            challenge_id=str(uuid.uuid4()),
            identity_type="AADHAAR",
            identifier=masked_id,
            message=f"Aadhaar OTP sent to the mobile linked with Aadhaar ending in {clean_id[-4:] if len(clean_id)>=4 else '...'}.",
            demo_hint=f"Demo OTP: {settings.DEMO_OTP}",
        )

    async def verify_challenge(self, identifier: str, challenge_token: str) -> VerificationResult:
        token = challenge_token.strip()
        if token == settings.DEMO_OTP:
            return VerificationResult(
                success=True,
                identifier=identifier,
                identity_type="AADHAAR",
                verified_name="Ramesh Kumar",
            )
        return VerificationResult(
            success=False,
            identifier=identifier,
            identity_type="AADHAAR",
            error_message="Invalid Aadhaar OTP. Please enter the valid 6-digit code.",
        )
