from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
from sqlalchemy.orm import Session
from ..schemas import ApiResponse, LivePlayer
from ..db import get_db
from ..database import get_database

router = APIRouter(prefix="/live", tags=["live"])


@router.get("/players", response_model=ApiResponse)
async def get_live_players(db_session: Session = Depends(get_db)):
    """Get list of currently live players."""
    try:
        db = get_database(db_session)
        players = db.get_live_sessions()
        return ApiResponse(success=True, data={"players": players})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/players/{player_id}", response_model=ApiResponse)
async def get_player_stream(player_id: str, db_session: Session = Depends(get_db)):
    """Get stream data for a specific player."""
    try:
        db = get_database(db_session)
        player = db.get_live_session(session_id=player_id)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        return ApiResponse(success=True, data=player)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
