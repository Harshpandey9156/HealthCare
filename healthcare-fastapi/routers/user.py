# healthcare-fastapi/routers/user.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.db import get_db
from middleware.auth_middleware import get_current_user
from models.user import User
from schemas.auth import UserOut
from schemas.user import ProfileResponse, UpdateProfileRequest
from services import user_service

router = APIRouter()


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await user_service.get_profile(current_user, db)
    return ProfileResponse(
        user=UserOut.model_validate(result["user"]),
        leaderboard=result["leaderboard"],
    )


@router.put("/profile", response_model=UserOut)
async def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    updated = await user_service.update_profile(current_user, payload, db)
    return UserOut.model_validate(updated)
