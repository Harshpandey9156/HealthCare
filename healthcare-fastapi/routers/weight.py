# healthcare-fastapi/routers/weight.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.db import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from schemas.weight import WeightLogCreate, WeightLogOut, WeightLogsResponse
from services import weight_service

router = APIRouter()


@router.get("/", response_model=WeightLogsResponse)
async def get_weight_logs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    logs = await weight_service.get_logs(current_user.id, db)
    return WeightLogsResponse(logs=logs)


@router.post("/", response_model=WeightLogOut, status_code=201)
async def add_weight_log(
    payload: WeightLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Auto-compute BMI if not provided
    if payload.bmi is None and current_user.height:
        h_m = current_user.height / 100
        payload.bmi = round(payload.weight / (h_m * h_m), 1)

    log = await weight_service.add_log(current_user.id, payload, db)
    return WeightLogOut.model_validate(log)
