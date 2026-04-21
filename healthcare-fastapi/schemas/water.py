# healthcare-fastapi/schemas/water.py
from typing import List, Optional
from pydantic import BaseModel, Field


class WaterLogCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Amount in litres")
    date: Optional[str] = None


class WaterLogOut(BaseModel):
    id: str
    amount: float
    time: Optional[str]

    model_config = {"from_attributes": True}


class WeeklyWaterEntry(BaseModel):
    day: str
    amount: float


class WaterLogsResponse(BaseModel):
    success: bool = True
    logs: List[WaterLogOut]
    total: float
    goal: float
    weekly_trend: List[WeeklyWaterEntry]
