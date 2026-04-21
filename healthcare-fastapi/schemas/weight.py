# healthcare-fastapi/schemas/weight.py
from typing import List, Optional
from pydantic import BaseModel, Field


class WeightLogCreate(BaseModel):
    date: Optional[str] = None
    weight: float = Field(..., gt=0)
    bmi: Optional[float] = Field(None, ge=0)


class WeightLogOut(BaseModel):
    id: str
    date: str
    weight: float
    bmi: Optional[float]

    model_config = {"from_attributes": True}


class WeightLogsResponse(BaseModel):
    success: bool = True
    logs: List[WeightLogOut]
