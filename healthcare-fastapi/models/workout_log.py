# healthcare-fastapi/models/workout_log.py
import uuid
from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from database.db import Base


class WorkoutLog(Base):
    __tablename__ = "workout_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    date: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    workout_type: Mapped[str] = mapped_column(String(30), nullable=False)
    duration: Mapped[int] = mapped_column(Integer, default=0)         # minutes
    calories_burned: Mapped[float] = mapped_column(Float, default=0)
    intensity: Mapped[str] = mapped_column(String(20), default="medium")
    emoji: Mapped[str] = mapped_column(String(10), default="🏋️")
    notes: Mapped[str] = mapped_column(String(500), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
