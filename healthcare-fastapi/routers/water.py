# healthcare-fastapi/routers/water.py
from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.db import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from schemas.water import WaterLogCreate, WaterLogOut, WaterLogsResponse
from services import water_service

router = APIRouter()


@router.get("/", response_model=WaterLogsResponse)
async def get_water_logs(
    for_date: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await water_service.get_logs(
        current_user.id, for_date or date.today().isoformat(), current_user, db
    )
    return WaterLogsResponse(
        logs=result["logs"],
        total=result["total"],
        goal=result["goal"],
        weekly_trend=result["weekly_trend"],
    )


@router.post("/", response_model=WaterLogOut, status_code=201)
async def add_water_log(
    payload: WaterLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    log = await water_service.add_log(current_user.id, payload, db)
    return WaterLogOut.model_validate(log)
