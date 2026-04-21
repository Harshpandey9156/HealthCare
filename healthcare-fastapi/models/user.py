# healthcare-fastapi/models/user.py
import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, Integer, String, JSON
from sqlalchemy.orm import Mapped, mapped_column
from database.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # Health profile
    age: Mapped[int] = mapped_column(Integer, default=25)
    gender: Mapped[str] = mapped_column(String(20), default="other")
    height: Mapped[float] = mapped_column(Float, default=170.0)
    weight: Mapped[float] = mapped_column(Float, default=70.0)
    target_weight: Mapped[float] = mapped_column(Float, default=65.0)
    calorie_goal: Mapped[int] = mapped_column(Integer, default=2000)
    water_goal: Mapped[float] = mapped_column(Float, default=2.5)
    activity_level: Mapped[str] = mapped_column(String(30), default="moderate")

    # Gamification
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    points: Mapped[int] = mapped_column(Integer, default=0)
    referral_code: Mapped[str] = mapped_column(String(20), nullable=True)
    theme: Mapped[str] = mapped_column(String(10), default="dark")

    # JSON fields (streaks + badges stored as JSON)
    streaks: Mapped[dict] = mapped_column(
        JSON,
        default=lambda: {
            "overall": {"current": 0, "longest": 0},
            "food":    {"current": 0, "longest": 0},
            "workout": {"current": 0, "longest": 0},
            "water":   {"current": 0, "longest": 0},
        },
    )
    badges: Mapped[list] = mapped_column(
        JSON,
        default=lambda: [
            {"id": "badge_001", "label": "First Log",    "emoji": "🥇", "earned": False},
            {"id": "badge_002", "label": "Week Streak",  "emoji": "🔥", "earned": False},
            {"id": "badge_003", "label": "Hydrated",     "emoji": "💧", "earned": False},
            {"id": "badge_004", "label": "Iron Will",    "emoji": "💪", "earned": False},
            {"id": "badge_005", "label": "Month Strong", "emoji": "🏅", "earned": False},
            {"id": "badge_006", "label": "Champion",     "emoji": "🏆", "earned": False},
        ],
    )

    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
