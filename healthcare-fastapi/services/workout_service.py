# healthcare-fastapi/services/workout_service.py
from datetime import date, timedelta
from typing import List

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.workout_log import WorkoutLog
from schemas.workout import WorkoutLogCreate, WeeklyMinutes

WORKOUT_EMOJIS = {
    "strength": "🏋️", "cardio": "🏃", "yoga": "🧘", "hiit": "⚡",
    "cycling": "🚴", "swimming": "🏊", "walking": "🚶", "rest": "🛌",
}
DAY_ABBR = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


async def get_logs(user_id: str, for_date: str, db: AsyncSession) -> dict:
    # Logs for selected date
    day_result = await db.execute(
        select(WorkoutLog)
        .where(WorkoutLog.user_id == user_id, WorkoutLog.date == for_date)
        .order_by(WorkoutLog.created_at.desc())
    )
    day_logs = day_result.scalars().all()

    # Last 30 for history
    all_result = await db.execute(
        select(WorkoutLog)
        .where(WorkoutLog.user_id == user_id)
        .order_by(WorkoutLog.date.desc())
        .limit(30)
    )
    all_logs = all_result.scalars().all()

    # Weekly minutes
    today = date.fromisoformat(for_date)
    weekly_minutes: List[WeeklyMinutes] = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        d_str = d.isoformat()
        res = await db.execute(
            select(func.coalesce(func.sum(WorkoutLog.duration), 0))
            .where(WorkoutLog.user_id == user_id, WorkoutLog.date == d_str)
        )
        mins = int(res.scalar() or 0)
        weekly_minutes.append(WeeklyMinutes(day=DAY_ABBR[d.weekday()], minutes=mins))

    return {"logs": day_logs, "all_logs": all_logs, "weekly_minutes": weekly_minutes}


async def create_log(user_id: str, payload: WorkoutLogCreate, db: AsyncSession) -> WorkoutLog:
    log = WorkoutLog(
        user_id=user_id,
        date=payload.date or date.today().isoformat(),
        name=payload.name,
        workout_type=payload.workout_type,
        duration=payload.duration,
        calories_burned=payload.calories_burned,
        intensity=payload.intensity,
        emoji=WORKOUT_EMOJIS.get(payload.workout_type, "🏋️"),
        notes=payload.notes,
    )
    db.add(log)
    await db.flush()
    return log


async def delete_log(user_id: str, log_id: str, db: AsyncSession) -> bool:
    result = await db.execute(
        select(WorkoutLog).where(WorkoutLog.id == log_id, WorkoutLog.user_id == user_id)
    )
    log = result.scalar_one_or_none()
    if not log:
        return False
    await db.delete(log)
    return True
