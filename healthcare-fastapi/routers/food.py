# healthcare-fastapi/routers/food.py
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database.db import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from schemas.food import FoodLogCreate, FoodLogOut, FoodLogsResponse
from services import food_service

router = APIRouter()


@router.get("/", response_model=FoodLogsResponse)
async def get_food_logs(
    for_date: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await food_service.get_logs(
        current_user.id, for_date or date.today().isoformat(), db
    )
    return FoodLogsResponse(
        logs=result["logs"],
        totals=result["totals"],
        trend=result["trend"],
    )


@router.post("/", response_model=FoodLogOut, status_code=201)
async def add_food_log(
    payload: FoodLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    log = await food_service.create_log(current_user.id, payload, db)
    return FoodLogOut.model_validate(log)


@router.delete("/{log_id}")
async def delete_food_log(
    log_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deleted = await food_service.delete_log(current_user.id, log_id, db)
    if not deleted:
        raise HTTPException(status_code=404, detail="Log not found")
    return {"success": True, "message": "Food log deleted"}
