"""
Database access layer using SQLAlchemy.
Provides a clean interface for database operations.
"""
import uuid
import json
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_

from .models import User as UserModel, LeaderboardEntry as LeaderboardModel, LiveSession, GameModeEnum
from .security import hash_password, verify_password


class Database:
    """Database access layer for Snake Arena Live."""

    def __init__(self, db: Session):
        """Initialize with database session."""
        self.db = db

    # User operations
    def get_user_by_email(self, email: str) -> Optional[dict]:
        """Get user by email address."""
        user = self.db.query(UserModel).filter(UserModel.email == email).first()
        return user.to_dict() if user else None

    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Get user by ID."""
        user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        return user.to_dict() if user else None

    def get_user_by_username(self, username: str) -> Optional[dict]:
        """Get user by username."""
        user = self.db.query(UserModel).filter(UserModel.username == username).first()
        return user.to_dict() if user else None

    def create_user(self, username: str, email: str, password: str) -> dict:
        """Create a new user."""
        # Check if email already exists
        if self.get_user_by_email(email):
            raise ValueError("Email already registered")
        
        # Check if username already exists
        if self.get_user_by_username(username):
            raise ValueError("Username already taken")

        user = UserModel(
            id=str(uuid.uuid4()),
            username=username,
            email=email,
            password_hash=hash_password(password),
            created_at=datetime.utcnow()
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user.to_dict()

    def verify_user_password(self, email: str, password: str) -> Optional[dict]:
        """Verify user password and return user if valid."""
        user = self.db.query(UserModel).filter(UserModel.email == email).first()
        if not user:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        return user.to_dict()

    # Leaderboard operations
    def get_leaderboard(self, mode: Optional[str] = None, limit: int = 100) -> List[dict]:
        """Get leaderboard entries, optionally filtered by mode."""
        query = self.db.query(LeaderboardModel)
        
        if mode:
            query = query.filter(LeaderboardModel.mode == GameModeEnum(mode))
        
        entries = query.order_by(desc(LeaderboardModel.score)).limit(limit).all()
        
        # Add rank to entries
        result = []
        for rank, entry in enumerate(entries, start=1):
            entry_dict = entry.to_dict()
            entry_dict['rank'] = rank
            result.append(entry_dict)
        
        return result

    def submit_score(self, user_id: str, score: int, mode: str) -> dict:
        """Submit a score to the leaderboard."""
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        entry = LeaderboardModel(
            id=str(uuid.uuid4()),
            user_id=user_id,
            username=user['username'],
            score=score,
            mode=GameModeEnum(mode),
            avatar=user.get('avatar'),
            created_at=datetime.utcnow()
        )
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        
        # Get rank
        rank = self.db.query(LeaderboardModel).filter(
            and_(
                LeaderboardModel.mode == GameModeEnum(mode),
                LeaderboardModel.score > score
            )
        ).count() + 1
        
        result = entry.to_dict()
        result['rank'] = rank
        return result

    def get_user_best_score(self, user_id: str, mode: str) -> Optional[int]:
        """Get user's best score for a specific mode."""
        entry = self.db.query(LeaderboardModel).filter(
            and_(
                LeaderboardModel.user_id == user_id,
                LeaderboardModel.mode == GameModeEnum(mode)
            )
        ).order_by(desc(LeaderboardModel.score)).first()
        
        return entry.score if entry else None

    # Live session operations
    def create_live_session(self, user_id: str, mode: str) -> dict:
        """Create a new live gaming session."""
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        # End any existing active sessions for this user
        self.db.query(LiveSession).filter(
            and_(
                LiveSession.user_id == user_id,
                LiveSession.status == "playing"
            )
        ).update({"status": "ended"})

        session = LiveSession(
            id=str(uuid.uuid4()),
            user_id=user_id,
            username=user['username'],
            score=0,
            mode=GameModeEnum(mode),
            status="playing",
            viewers=0,
            avatar=user.get('avatar'),
            game_state=json.dumps({
                "snake": [{"x": 10, "y": 10}, {"x": 9, "y": 10}, {"x": 8, "y": 10}],
                "food": {"x": 15, "y": 15},
                "direction": "RIGHT"
            }),
            started_at=datetime.utcnow(),
            last_update=datetime.utcnow()
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session.to_dict()

    def update_live_session(self, session_id: str, score: int, game_state: dict) -> dict:
        """Update live session with new game state."""
        session = self.db.query(LiveSession).filter(LiveSession.id == session_id).first()
        if not session:
            raise ValueError("Live session not found")

        session.score = score
        session.game_state = json.dumps(game_state)
        session.last_update = datetime.utcnow()
        self.db.commit()
        self.db.refresh(session)
        return session.to_dict()

    def end_live_session(self, session_id: str) -> dict:
        """End a live gaming session."""
        session = self.db.query(LiveSession).filter(LiveSession.id == session_id).first()
        if not session:
            raise ValueError("Live session not found")

        session.status = "ended"
        self.db.commit()
        self.db.refresh(session)
        return session.to_dict()

    def get_live_sessions(self, status: str = "playing") -> List[dict]:
        """Get all active live gaming sessions."""
        sessions = self.db.query(LiveSession).filter(
            LiveSession.status == status
        ).order_by(desc(LiveSession.viewers)).all()
        
        return [session.to_dict() for session in sessions]

    def get_live_session(self, session_id: str) -> Optional[dict]:
        """Get a specific live session by ID."""
        session = self.db.query(LiveSession).filter(LiveSession.id == session_id).first()
        return session.to_dict() if session else None

    def increment_session_viewers(self, session_id: str) -> dict:
        """Increment viewer count for a live session."""
        session = self.db.query(LiveSession).filter(LiveSession.id == session_id).first()
        if not session:
            raise ValueError("Live session not found")

        session.viewers += 1
        self.db.commit()
        self.db.refresh(session)
        return session.to_dict()

    def decrement_session_viewers(self, session_id: str) -> dict:
        """Decrement viewer count for a live session."""
        session = self.db.query(LiveSession).filter(LiveSession.id == session_id).first()
        if not session:
            raise ValueError("Live session not found")

        session.viewers = max(0, session.viewers - 1)
        self.db.commit()
        self.db.refresh(session)
        return session.to_dict()


# Legacy MockDatabase for backwards compatibility during transition
class MockDatabase(Database):
    """Deprecated: Use Database class with dependency injection instead."""
    pass


# Helper function to get Database instance with session
def get_database(db_session: Session) -> Database:
    """
    Get Database instance for dependency injection.
    
    Usage in routers:
        from sqlalchemy.orm import Session
        from ..db import get_db
        from ..database import get_database
        
        @router.get("/users")
        def get_users(db_session: Session = Depends(get_db)):
            db = get_database(db_session)
            return db.get_all_users()
    """
    return Database(db_session)

        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        entry_id = str(len(self.leaderboard) + 1)
        entry = {
            "id": entry_id,
            "rank": 0,
            "username": user["username"],
            "score": score,
            "mode": mode,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "avatar": user.get("avatar"),
        }

        self.leaderboard.append(entry)
        # Re-rank
        self.leaderboard.sort(key=lambda x: x["score"], reverse=True)
        for idx, e in enumerate(self.leaderboard):
            e["rank"] = idx + 1

        return entry

    # Live players operations
    def get_live_players(self) -> list[dict]:
        return self.live_players.copy()

    def get_player_stream(self, player_id: str) -> Optional[dict]:
        for player in self.live_players:
            if player["id"] == player_id:
                return player.copy()
        return None

    def update_live_player(self, player_id: str, updates: dict) -> Optional[dict]:
        for player in self.live_players:
            if player["id"] == player_id:
                player.update(updates)
                return player.copy()
        return None

    # Reset for testing
    def reset(self):
        """Reset to initial state."""
        self.__init__()


# Global database instance
db = MockDatabase()
