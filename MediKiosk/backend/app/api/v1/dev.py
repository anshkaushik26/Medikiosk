"""Development helpers and reset endpoint."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.services.seed_service import reset_demo_database

router = APIRouter(prefix="/dev", tags=["Development"])


@router.post("/reset-demo")
async def reset_demo(db: AsyncSession = Depends(get_db)):
    """Reset all database records and re-seed clean demo accounts (Ramesh Kumar, Dr. Sharma)."""
    result = await reset_demo_database(db)
    return result
