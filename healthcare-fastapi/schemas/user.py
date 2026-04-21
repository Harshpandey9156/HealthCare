# healthcare-fastapi/schemas/user.py
from typing import Any, List, Optional
from pydantic import BaseModel, Field
from schemas.auth import UserOut


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=120)
    age: Optional[int] = Field(None, ge=1, le=120)
    gender: Optional[str] = None
    height: Optional[float] = Field(None, gt=0)
    weight: Optional[float] = Field(None, gt=0)
    target_weight: Optional[float] = Field(None, gt=0)
    calorie_goal: Optional[int] = Field(None, gt=0)
    water_goal: Optional[float] = Field(None, gt=0)
    activity_level: Optional[str] = None
    theme: Optional[str] = None


class LeaderboardEntry(BaseModel):
    rank: int
    name: str
    points: int
    streak: int
    avatar: None = None
    is_current_user: bool = False


class ProfileResponse(BaseModel):
    success: bool = True
    user: UserOut
    leaderboard: List[LeaderboardEntry]
