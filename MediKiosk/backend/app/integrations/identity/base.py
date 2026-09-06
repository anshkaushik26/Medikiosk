"""Identity Provider Interface Abstraction."""
from abc import ABC, abstractmethod
from typing import Optional
from pydantic import BaseModel


class VerificationChallenge(BaseModel):
    challenge_id: str
    identity_type: str
    identifier: str
    message: str
    expires_in_seconds: int = 300
    demo_hint: Optional[str] = None


class VerificationResult(BaseModel):
    success: bool
    identifier: str
    identity_type: str
    verified_name: Optional[str] = None
    error_message: Optional[str] = None


class IdentityProvider(ABC):
    """Abstract base class for all identity verification adapters (ABHA, Aadhaar, Mobile)."""

    @abstractmethod
    async def initiate_verification(self, identifier: str) -> VerificationChallenge:
        """Initiate verification (e.g. request ABDM OTP, UIDAI challenge, or SMS OTP)."""
        pass

    @abstractmethod
    async def verify_challenge(self, identifier: str, challenge_token: str) -> VerificationResult:
        """Verify the user challenge response (e.g. 6-digit OTP)."""
        pass
