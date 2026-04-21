# healthcare-fastapi/schemas/workout.py
from typing import List, Literal, Optional
from pydantic import BaseModel, Field

WORKOUT_TYPES = Literal["strength", "cardio", "yoga", "hiit", "cycling", "swimming", "walking", "rest"]
INTENSITIES   = Literal["low", "medium", "high"]


class WorkoutLogCreate(BaseModel):
    date: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=200)
    workout_type: WORKOUT_TYPES
    duration: int = Field(..., ge=1)
    calories_burned: float = Field(0, ge=0)
    intensity: INTENSITIES = "medium"
    notes: Optional[str] = None


class WorkoutLogOut(BaseModel):
    id: str
    date: str
    name: str
    workout_type: str
    duration: int
    calories_burned: float
    intensity: str
    emoji: str

    model_config = {"from_attributes": True}


class WeeklyMinutes(BaseModel):
    day: str
    minutes: int


class WeeklyPlanDay(BaseModel):
    day: str
    workout: str
    type: str
    duration: int
    planned: bool
    emoji: str


class WorkoutLogsResponse(BaseModel):
    success: bool = True
    logs: List[WorkoutLogOut]
    all_logs: List[WorkoutLogOut]
    weekly_minutes: List[WeeklyMinutes]
