# healthcare-fastapi/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import engine, Base
from routers import auth, food, workout, water, weight, user

app = FastAPI(
    title="VitalTrack API",
    description="Healthcare & fitness tracking REST API built with FastAPI + PostgreSQL",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,    prefix="/api/auth",    tags=["Auth"])
app.include_router(food.router,    prefix="/api/food",    tags=["Food"])
app.include_router(workout.router, prefix="/api/workout", tags=["Workout"])
app.include_router(water.router,   prefix="/api/water",   tags=["Water"])
app.include_router(weight.router,  prefix="/api/weight",  tags=["Weight"])
app.include_router(user.router,    prefix="/api/user",    tags=["User"])


# ── Startup: create tables ────────────────────────────────────────────────────
@app.on_event("startup")
async def on_startup() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "VitalTrack API is running 🚀"}
