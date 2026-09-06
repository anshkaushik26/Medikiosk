"""Identity Provider Factory."""
from backend.app.models.identity import IdentityType
from backend.app.integrations.identity.base import IdentityProvider
from backend.app.integrations.identity.abha_adapter import ABHAProvider
from backend.app.integrations.identity.aadhaar_adapter import AadhaarProvider
from backend.app.integrations.identity.mobile_adapter import MobileProvider


def get_identity_provider(identity_type: str | IdentityType) -> IdentityProvider:
    """Instantiate the appropriate identity verification adapter."""
    normalized = str(identity_type).upper()
    if "ABHA" in normalized:
        return ABHAProvider()
    elif "AADHAAR" in normalized or "AADHAR" in normalized:
        return AadhaarProvider()
    elif "MOBILE" in normalized or "PHONE" in normalized:
        return MobileProvider()
    else:
        raise ValueError(f"Unsupported identity type: {identity_type}")
