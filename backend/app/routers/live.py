from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..schemas import ApiResponse, LivePlayer
from ..database import db

router = APIRouter(prefix="/live", tags=["live"])


@router.get("/players", response_model=ApiResponse)
async def get_live_players():
    """Get list of currently live players."""
    try:
        players = db.get_live_players()
        return ApiResponse(success=True, data={"players": players})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/players/{player_id}", response_model=ApiResponse)
async def get_player_stream(player_id: str):
    """Get stream data for a specific player."""
    try:
        player = db.get_player_stream(player_id=player_id)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        return ApiResponse(success=True, data=player)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
