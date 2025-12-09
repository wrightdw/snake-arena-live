from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class Direction(str, Enum):
    UP = "UP"
    DOWN = "DOWN"
    LEFT = "LEFT"
    RIGHT = "RIGHT"


class GameMode(str, Enum):
    WALLS = "walls"
    PASS_THROUGH = "pass-through"


class Position(BaseModel):
    x: int
    y: int


class User(BaseModel):
    id: str
    username: str
    email: str
    avatar: Optional[str] = None
    created_at: str


class LoginCredentials(BaseModel):
    email: EmailStr
    password: str


class SignupCredentials(BaseModel):
    username: str
    email: EmailStr
    password: str


class LeaderboardEntry(BaseModel):
    id: str
    rank: int
    username: str
    score: int
    mode: GameMode
    date: str
    avatar: Optional[str] = None


class LivePlayer(BaseModel):
    id: str
    username: str
    avatar: Optional[str] = None
    score: int
    mode: GameMode
    snake: list[Position]
    food: Position
    direction: Direction
    status: str  # "idle" | "playing" | "paused" | "game-over"
    viewers: int


class ApiResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
