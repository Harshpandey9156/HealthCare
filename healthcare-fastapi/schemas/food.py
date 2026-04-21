# healthcare-fastapi/schemas/food.py
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class FoodLogCreate(BaseModel):
    date: Optional[str] = None          # defaults to today in service
    meal_type: str = Field(..., pattern=r"^(breakfast|lunch|snack|dinner)$")
    food_name: str = Field(..., min_length=1, max_length=200)
    calories: float = Field(..., ge=0)
    protein: float = Field(0, ge=0)
    carbs: float = Field(0, ge=0)
    fats: float = Field(0, ge=0)
    fiber: float = Field(0, ge=0)
    time: Optional[str] = None
    # Premium micronutrients
    calcium: Optional[float] = Field(None, ge=0)
    iron: Optional[float] = Field(None, ge=0)
    magnesium: Optional[float] = Field(None, ge=0)


class FoodLogOut(BaseModel):
    id: str
    date: str
    meal_type: str
    food_name: str
    calories: float
    protein: float
    carbs: float
    fats: float
    fiber: float
    time: Optional[str]
    calcium: Optional[float]
    iron: Optional[float]
    magnesium: Optional[float]

    model_config = {"from_attributes": True}


class MacroTotals(BaseModel):
    calories: float
    protein: float
    carbs: float
    fats: float
    fiber: float


class CalorieTrendEntry(BaseModel):
    day: str
    calories: float
    date: str


class FoodLogsResponse(BaseModel):
    success: bool = True
    logs: List[FoodLogOut]
    totals: MacroTotals
    trend: List[CalorieTrendEntry]
