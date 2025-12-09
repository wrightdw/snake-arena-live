"""
SQLAlchemy database models for Snake Arena Live.
"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Index, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()


class GameModeEnum(str, enum.Enum):
    """Game mode enumeration."""
    walls = "walls"
    pass_through = "pass-through"


class User(Base):
    """User model for authentication and profile."""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    avatar = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "avatar": self.avatar,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class LeaderboardEntry(Base):
    """Leaderboard entry model."""
    __tablename__ = "leaderboard"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), nullable=False, index=True)
    username = Column(String(50), nullable=False)
    score = Column(Integer, nullable=False, index=True)
    mode = Column(SQLEnum(GameModeEnum), nullable=False, index=True)
    avatar = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Indexes for efficient queries
    __table_args__ = (
        Index('idx_leaderboard_score_mode', 'score', 'mode'),
        Index('idx_leaderboard_user_mode', 'user_id', 'mode'),
    )
    
    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "username": self.username,
            "score": self.score,
            "mode": self.mode.value if isinstance(self.mode, GameModeEnum) else self.mode,
            "date": self.created_at.strftime("%Y-%m-%d") if self.created_at else None,
            "avatar": self.avatar,
        }


class LiveSession(Base):
    """Live gaming session for spectator mode."""
    __tablename__ = "live_sessions"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), nullable=False, index=True)
    username = Column(String(50), nullable=False)
    score = Column(Integer, default=0, nullable=False)
    mode = Column(SQLEnum(GameModeEnum), nullable=False)
    status = Column(String(20), default="playing", nullable=False)
    viewers = Column(Integer, default=0, nullable=False)
    game_state = Column(Text, nullable=True)  # JSON string of snake, food, direction
    avatar = Column(String(500), nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_update = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    __table_args__ = (
        Index('idx_live_status', 'status'),
    )
    
    def to_dict(self):
        """Convert model to dictionary."""
        import json
        game_state = json.loads(self.game_state) if self.game_state else {}
        return {
            "id": self.id,
            "username": self.username,
            "score": self.score,
            "mode": self.mode.value if isinstance(self.mode, GameModeEnum) else self.mode,
            "status": self.status,
            "viewers": self.viewers,
            "avatar": self.avatar,
            **game_state,  # Includes snake, food, direction
        }
