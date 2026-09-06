"""Mobile SMS Identity Provider Adapter."""
import uuid
from backend.app.core.config import settings
from backend.app.integrations.identity.base import IdentityProvider, VerificationChallenge, VerificationResult


class MobileProvider(IdentityProvider):
    """Adapter for Mobile Number verification (mock for SMS gateway)."""

    async def initiate_verification(self, identifier: str) -> VerificationChallenge:
        clean_mobile = identifier.strip()
        return VerificationChallenge(
            challenge_id=str(uuid.uuid4()),
            identity_type="MOBILE",
            identifier=clean_mobile,
            message=f"6-digit SMS verification code sent to {clean_mobile}.",
            demo_hint=f"Demo OTP: {settings.DEMO_OTP}",
        )

    async def verify_challenge(self, identifier: str, challenge_token: str) -> VerificationResult:
        token = challenge_token.strip()
        if token == settings.DEMO_OTP:
            return VerificationResult(
                success=True,
                identifier=identifier,
                identity_type="MOBILE",
                verified_name=None,
            )
        return VerificationResult(
            success=False,
            identifier=identifier,
            identity_type="MOBILE",
            error_message="Invalid Mobile OTP. Please enter the valid 6-digit code.",
        )
