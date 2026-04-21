# healthcare-fastapi/services/water_service.py
from datetime import date, timedelta
from typing import List

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.water_log import WaterLog
from models.user import User
from schemas.water import WaterLogCreate, WeeklyWaterEntry

DAY_ABBR = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


async def get_logs(user_id: str, for_date: str, user: User, db: AsyncSession) -> dict:
    result = await db.execute(
        select(WaterLog)
        .where(WaterLog.user_id == user_id, WaterLog.date == for_date)
        .order_by(WaterLog.created_at.asc())
    )
    logs = result.scalars().all()
    total = sum(l.amount for l in logs)

    # Weekly trend (7 days)
    today = date.fromisoformat(for_date)
    weekly_trend: List[WeeklyWaterEntry] = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        d_str = d.isoformat()
        res = await db.execute(
            select(func.coalesce(func.sum(WaterLog.amount), 0.0))
            .where(WaterLog.user_id == user_id, WaterLog.date == d_str)
        )
        amt = float(res.scalar() or 0)
        weekly_trend.append(WeeklyWaterEntry(day=DAY_ABBR[d.weekday()], amount=round(amt, 2)))

    return {"logs": logs, "total": round(total, 2), "goal": user.water_goal, "weekly_trend": weekly_trend}


async def add_log(user_id: str, payload: WaterLogCreate, db: AsyncSession) -> WaterLog:
    from datetime import datetime as dt
    log = WaterLog(
        user_id=user_id,
        date=payload.date or date.today().isoformat(),
        amount=payload.amount,
        time=dt.now().strftime("%I:%M %p"),
    )
    db.add(log)
    await db.flush()
    return log
