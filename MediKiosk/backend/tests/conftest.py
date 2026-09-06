"""Pytest fixtures."""
import pytest_asyncio
from backend.app.core.database import engine, async_session_factory
from backend.app.models.base import Base
# Import all models to ensure metadata is fully loaded
import backend.app.models.user
import backend.app.models.identity
import backend.app.models.patient
import backend.app.models.doctor
import backend.app.models.preferences
import backend.app.models.clinical
import backend.app.models.interview
from backend.app.services.seed_service import seed_demo_data


@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with async_session_factory() as session:
        await seed_demo_data(session)
    yield
