# healthcare-fastapi/services/auth_service.py
import random
import string
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

try:
    from jose import jwt
except ImportError:
    from python_jose import jwt  # type: ignore

from database.db import settings
from models.user import User
from schemas.auth import RegisterRequest

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    return _pwd.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd.verify(plain, hashed)


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": user_id, "exp": expire},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def _referral_code(name: str) -> str:
    prefix = name.upper()[:4]
    suffix = "".join(random.choices(string.digits, k=4))
    return f"{prefix}{suffix}"


async def register_user(payload: RegisterRequest, db: AsyncSession) -> tuple[str, User]:
    # Check duplicate email
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    if result.scalar_one_or_none():
        from fastapi import HTTPException
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        name=payload.name.strip(),
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        age=payload.age or 25,
        gender=payload.gender or "other",
        height=payload.height or 170.0,
        weight=payload.weight or 70.0,
        target_weight=payload.target_weight or 65.0,
        calorie_goal=payload.calorie_goal or 2000,
        water_goal=payload.water_goal or 2.5,
        activity_level=payload.activity_level or "moderate",
        referral_code=_referral_code(payload.name),
    )
    db.add(user)
    await db.flush()      # gets the id without committing

    token = create_access_token(user.id)
    return token, user


async def login_user(email: str, password: str, db: AsyncSession) -> tuple[str, User]:
    from fastapi import HTTPException
    result = await db.execute(select(User).where(User.email == email.lower()))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user.id)
    return token, user
