"""ABHA (Ayushman Bharat Health Account) Identity Provider Adapter."""
import uuid
from backend.app.core.config import settings
from backend.app.integrations.identity.base import IdentityProvider, VerificationChallenge, VerificationResult


class ABHAProvider(IdentityProvider):
    """Adapter for ABHA ID / ABHA Address verification (mock for ABDM gateway)."""

    async def initiate_verification(self, identifier: str) -> VerificationChallenge:
        clean_id = identifier.strip().replace(" ", "").replace("-", "")
        return VerificationChallenge(
            challenge_id=str(uuid.uuid4()),
            identity_type="ABHA",
            identifier=identifier,
            message="Verification OTP sent to the mobile number registered with your ABHA ID.",
            demo_hint=f"Demo OTP: {settings.DEMO_OTP}",
        )

    async def verify_challenge(self, identifier: str, challenge_token: str) -> VerificationResult:
        token = challenge_token.strip()
        if token == settings.DEMO_OTP:
            return VerificationResult(
                success=True,
                identifier=identifier,
                identity_type="ABHA",
                verified_name="Ramesh Kumar",
            )
        return VerificationResult(
            success=False,
            identifier=identifier,
            identity_type="ABHA",
            error_message="Invalid OTP. Please enter the 6-digit verification code.",
        )
