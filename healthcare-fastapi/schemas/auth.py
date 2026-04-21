# healthcare-fastapi/schemas/auth.py
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    age: Optional[int] = Field(25, ge=1, le=120)
    gender: Optional[str] = "other"
    height: Optional[float] = Field(170.0, gt=0)
    weight: Optional[float] = Field(70.0, gt=0)
    target_weight: Optional[float] = Field(65.0, gt=0)
    calorie_goal: Optional[int] = Field(2000, gt=0)
    water_goal: Optional[float] = Field(2.5, gt=0)
    activity_level: Optional[str] = "moderate"

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        allowed = {"male", "female", "other"}
        if v not in allowed:
            raise ValueError(f"gender must be one of {allowed}")
        return v

    @field_validator("activity_level")
    @classmethod
    def validate_activity(cls, v: str) -> str:
        allowed = {"sedentary", "light", "moderate", "active", "very_active"}
        if v not in allowed:
            raise ValueError(f"activity_level must be one of {allowed}")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class StreakEntry(BaseModel):
    current: int = 0
    longest: int = 0


class Streaks(BaseModel):
    overall: StreakEntry = StreakEntry()
    food:    StreakEntry = StreakEntry()
    workout: StreakEntry = StreakEntry()
    water:   StreakEntry = StreakEntry()


class Badge(BaseModel):
    id: str
    label: str
    emoji: str
    earned: bool


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    age: int
    gender: str
    height: float
    weight: float
    target_weight: float
    calorie_goal: int
    water_goal: float
    activity_level: str
    is_premium: bool
    points: int
    referral_code: Optional[str]
    theme: str
    streaks: Any
    badges: Any
    joined_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    success: bool = True
    token: str
    user: UserOut
