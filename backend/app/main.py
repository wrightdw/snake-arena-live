from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, leaderboard, live
from .db import init_db, seed_database

app = FastAPI(
    title="Snake Arena Backend",
    description="FastAPI backend for Snake Arena Live",
    version="0.1.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event to initialize database
@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup."""
    init_db()
    seed_database()


# Include routers
app.include_router(auth.router)
app.include_router(leaderboard.router)
app.include_router(live.router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Snake Arena Backend API"}
