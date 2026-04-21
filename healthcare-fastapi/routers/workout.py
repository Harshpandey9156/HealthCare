# healthcare-fastapi/routers/workout.py
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database.db import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from schemas.workout import WorkoutLogCreate, WorkoutLogOut, WorkoutLogsResponse
from services import workout_service

router = APIRouter()


@router.get("/", response_model=WorkoutLogsResponse)
async def get_workout_logs(
    for_date: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await workout_service.get_logs(
        current_user.id, for_date or date.today().isoformat(), db
    )
    return WorkoutLogsResponse(
        logs=result["logs"],
        all_logs=result["all_logs"],
        weekly_minutes=result["weekly_minutes"],
    )


@router.post("/", response_model=WorkoutLogOut, status_code=201)
async def add_workout_log(
    payload: WorkoutLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    log = await workout_service.create_log(current_user.id, payload, db)
    # Award 25 points per workout
    current_user.points = (current_user.points or 0) + 25
    return WorkoutLogOut.model_validate(log)


@router.delete("/{log_id}")
async def delete_workout_log(
    log_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deleted = await workout_service.delete_log(current_user.id, log_id, db)
    if not deleted:
        raise HTTPException(status_code=404, detail="Log not found")
    return {"success": True, "message": "Workout log deleted"}
