import uuid
from datetime import datetime
from typing import Optional
from .schemas import User, LeaderboardEntry, LivePlayer, Position, Direction, GameMode


class MockDatabase:
    """Mock in-memory database for development."""

    def __init__(self):
        self.users: dict[str, dict] = {
            "user1@example.com": {
                "id": "1",
                "username": "PixelMaster",
                "email": "user1@example.com",
                "password_hash": self._hash_password("password123"),
                "avatar": None,
                "created_at": "2024-01-15",
            },
            "user2@example.com": {
                "id": "2",
                "username": "SnakeKing",
                "email": "user2@example.com",
                "password_hash": self._hash_password("password123"),
                "avatar": None,
                "created_at": "2024-02-20",
            },
        }

        self.leaderboard: list[dict] = [
            {
                "id": "1",
                "rank": 1,
                "username": "NeonViper",
                "score": 2450,
                "mode": "walls",
                "date": "2024-12-07",
                "avatar": None,
            },
            {
                "id": "2",
                "rank": 2,
                "username": "PixelMaster",
                "score": 2100,
                "mode": "walls",
                "date": "2024-12-06",
                "avatar": None,
            },
            {
                "id": "3",
                "rank": 3,
                "username": "CyberSnake",
                "score": 1890,
                "mode": "pass-through",
                "date": "2024-12-05",
                "avatar": None,
            },
            {
                "id": "4",
                "rank": 4,
                "username": "RetroGamer",
                "score": 1750,
                "mode": "walls",
                "date": "2024-12-04",
                "avatar": None,
            },
            {
                "id": "5",
                "rank": 5,
                "username": "ArcadeKing",
                "score": 1620,
                "mode": "pass-through",
                "date": "2024-12-03",
                "avatar": None,
            },
        ]

        self.live_players: list[dict] = [
            {
                "id": "live1",
                "username": "StreamerPro",
                "score": 340,
                "mode": "walls",
                "snake": [{"x": 10, "y": 10}, {"x": 9, "y": 10}, {"x": 8, "y": 10}],
                "food": {"x": 15, "y": 15},
                "direction": "RIGHT",
                "status": "playing",
                "viewers": 42,
                "avatar": None,
            },
            {
                "id": "live2",
                "username": "NightOwl",
                "score": 180,
                "mode": "pass-through",
                "snake": [{"x": 5, "y": 5}, {"x": 4, "y": 5}, {"x": 3, "y": 5}],
                "food": {"x": 10, "y": 10},
                "direction": "UP",
                "status": "playing",
                "viewers": 28,
                "avatar": None,
            },
        ]

    def _hash_password(self, password: str) -> str:
        """Simple password hashing (use proper hashing in production)."""
        import hashlib
        return hashlib.sha256(password.encode()).hexdigest()

    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash."""
        return self._hash_password(password) == password_hash

    # User operations
    def get_user_by_email(self, email: str) -> Optional[dict]:
        return self.users.get(email)

    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        for user in self.users.values():
            if user["id"] == user_id:
                return user
        return None

    def create_user(self, username: str, email: str, password: str) -> dict:
        if email in self.users:
            raise ValueError("Email already registered")

        user_id = str(len(self.users) + 1)
        user = {
            "id": user_id,
            "username": username,
            "email": email,
            "password_hash": self._hash_password(password),
            "avatar": None,
            "created_at": datetime.now().strftime("%Y-%m-%d"),
        }
        self.users[email] = user
        return user

    # Leaderboard operations
    def get_leaderboard(self, mode: Optional[str] = None) -> list[dict]:
        entries = self.leaderboard.copy()
        if mode:
            entries = [e for e in entries if e["mode"] == mode]
        return sorted(entries, key=lambda x: x["score"], reverse=True)

    def submit_score(self, user_id: str, score: int, mode: str) -> dict:
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
