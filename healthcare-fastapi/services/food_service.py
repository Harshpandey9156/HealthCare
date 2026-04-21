# healthcare-fastapi/services/food_service.py
from datetime import date, timedelta
from typing import List

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.food_log import FoodLog
from schemas.food import FoodLogCreate, MacroTotals, CalorieTrendEntry


async def get_logs(user_id: str, for_date: str, db: AsyncSession) -> dict:
    result = await db.execute(
        select(FoodLog)
        .where(FoodLog.user_id == user_id, FoodLog.date == for_date)
        .order_by(FoodLog.created_at.asc())
    )
    logs = result.scalars().all()

    totals = MacroTotals(
        calories=sum(l.calories for l in logs),
        protein=sum(l.protein  for l in logs),
        carbs=sum(l.carbs      for l in logs),
        fats=sum(l.fats        for l in logs),
        fiber=sum(l.fiber      for l in logs),
    )

    # Build 7-day calorie trend
    DAY_ABBR = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    trend: List[CalorieTrendEntry] = []
    today = date.fromisoformat(for_date)
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        d_str = d.isoformat()
        res = await db.execute(
            select(func.coalesce(func.sum(FoodLog.calories), 0.0))
            .where(FoodLog.user_id == user_id, FoodLog.date == d_str)
        )
        cal = float(res.scalar() or 0)
        trend.append(CalorieTrendEntry(day=DAY_ABBR[d.weekday()], calories=cal, date=d_str))

    return {"logs": logs, "totals": totals, "trend": trend}


async def create_log(user_id: str, payload: FoodLogCreate, db: AsyncSession) -> FoodLog:
    from datetime import datetime as dt
    log = FoodLog(
        user_id=user_id,
        date=payload.date or date.today().isoformat(),
        meal_type=payload.meal_type,
        food_name=payload.food_name,
        calories=payload.calories,
        protein=payload.protein,
        carbs=payload.carbs,
        fats=payload.fats,
        fiber=payload.fiber,
        time=payload.time or dt.now().strftime("%I:%M %p"),
        calcium=payload.calcium,
        iron=payload.iron,
        magnesium=payload.magnesium,
    )
    db.add(log)
    await db.flush()
    return log


async def delete_log(user_id: str, log_id: str, db: AsyncSession) -> bool:
    result = await db.execute(
        select(FoodLog).where(FoodLog.id == log_id, FoodLog.user_id == user_id)
    )
    log = result.scalar_one_or_none()
    if not log:
        return False
    await db.delete(log)
    return True
