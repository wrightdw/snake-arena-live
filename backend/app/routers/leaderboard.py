from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from sqlalchemy.orm import Session
from ..schemas import ApiResponse, LeaderboardEntry, GameMode
from ..db import get_db
from ..database import get_database
from ..routers.auth import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("", response_model=ApiResponse)
async def get_leaderboard(mode: Optional[str] = Query(None), db_session: Session = Depends(get_db)):
    """Get leaderboard entries, optionally filtered by game mode."""
    try:
        db = get_database(db_session)
        entries = db.get_leaderboard(mode=mode)
        return ApiResponse(success=True, data={"entries": entries})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/submit", response_model=ApiResponse)
async def submit_score(
    score: int, mode: str, user: dict = Depends(get_current_user), db_session: Session = Depends(get_db)
):
    """Submit a score to the leaderboard."""
    if score < 0:
        raise HTTPException(status_code=400, detail="Score cannot be negative")

    if mode not in ["walls", "pass-through"]:
        raise HTTPException(status_code=400, detail="Invalid game mode")

    try:
        db = get_database(db_session)
        entry = db.submit_score(user_id=user["id"], score=score, mode=mode)
        return ApiResponse(success=True, data=entry)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
