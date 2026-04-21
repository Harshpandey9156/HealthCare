# healthcare-fastapi/services/user_service.py
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.user import User
from models.workout_log import WorkoutLog
from schemas.user import UpdateProfileRequest, LeaderboardEntry


async def get_profile(current_user: User, db: AsyncSession) -> dict:
    # Top 10 users by points for leaderboard
    result = await db.execute(
        select(User).order_by(User.points.desc()).limit(10)
    )
    top_users = result.scalars().all()

    leaderboard = []
    for rank, u in enumerate(top_users, start=1):
        leaderboard.append(
            LeaderboardEntry(
                rank=rank,
                name=u.name,
                points=u.points,
                streak=u.streaks.get("overall", {}).get("current", 0) if isinstance(u.streaks, dict) else 0,
                is_current_user=(u.id == current_user.id),
            )
        )

    return {"user": current_user, "leaderboard": leaderboard}


async def update_profile(user: User, payload: UpdateProfileRequest, db: AsyncSession) -> User:
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    await db.flush()
    return user
