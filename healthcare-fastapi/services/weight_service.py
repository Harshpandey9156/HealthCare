# healthcare-fastapi/services/weight_service.py
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.weight_log import WeightLog
from schemas.weight import WeightLogCreate


async def get_logs(user_id: str, db: AsyncSession) -> list:
    result = await db.execute(
        select(WeightLog)
        .where(WeightLog.user_id == user_id)
        .order_by(WeightLog.date.desc())
        .limit(90)
    )
    return result.scalars().all()


async def add_log(user_id: str, payload: WeightLogCreate, db: AsyncSession) -> WeightLog:
    log = WeightLog(
        user_id=user_id,
        date=payload.date or date.today().isoformat(),
        weight=payload.weight,
        bmi=payload.bmi,
    )
    db.add(log)
    await db.flush()
    return log
