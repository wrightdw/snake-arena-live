from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .routers import auth, leaderboard, live
from .db import init_db, seed_database
import traceback

app = FastAPI(
    title="Snake Arena Backend",
    description="FastAPI backend for Snake Arena Live",
    version="0.1.0",
)

# CORS middleware - must be before other middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch all unhandled exceptions and return proper JSON response."""
    print(f"ERROR: Unhandled exception on {request.method} {request.url}")
    print(f"Exception: {exc}")
    traceback.print_exc()
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "error": f"Internal server error: {str(exc)}"
        },
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
        }
    )


# Startup event to initialize database
@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup."""
    try:
        init_db()
        seed_database()
        print("Database initialized successfully")
    except Exception as e:
        print(f"ERROR during startup: {e}")
        traceback.print_exc()


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
