"""
Database connection and session management.
Supports both SQLite (development) and PostgreSQL (production).
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from typing import Generator

from .models import Base

# Get database URL from environment or use SQLite as default
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./snake_arena.db"
)

# For PostgreSQL, handle both postgres:// and postgresql:// schemes
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create engine with appropriate settings
if DATABASE_URL.startswith("sqlite"):
    # SQLite-specific settings
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False  # Set to True for SQL debugging
    )
else:
    # PostgreSQL settings
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        echo=True  # Enable SQL logging for debugging
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database by creating all tables."""
    Base.metadata.create_all(bind=engine)


def drop_db():
    """Drop all tables (use with caution!)."""
    Base.metadata.drop_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for FastAPI to get database session.
    
    Usage:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    """
    Context manager for database session.
    
    Usage:
        with get_db_context() as db:
            user = db.query(User).first()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_database():
    """Seed database with initial data for development."""
    from .models import User, LeaderboardEntry, GameModeEnum
    from .security import hash_password
    import uuid
    from datetime import datetime, timedelta
    
    with get_db_context() as db:
        # Check if already seeded
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("Database already seeded, skipping...")
            return
        
        print("Seeding database...")
        
        # Create demo users
        demo_users = [
            User(
                id=str(uuid.uuid4()),
                username="PixelMaster",
                email="user1@example.com",
                password_hash=hash_password("password123"),
                created_at=datetime.utcnow() - timedelta(days=50)
            ),
            User(
                id=str(uuid.uuid4()),
                username="SnakeKing",
                email="user2@example.com",
                password_hash=hash_password("password123"),
                created_at=datetime.utcnow() - timedelta(days=40)
            ),
            User(
                id=str(uuid.uuid4()),
                username="NeonViper",
                email="user3@example.com",
                password_hash=hash_password("password123"),
                created_at=datetime.utcnow() - timedelta(days=30)
            ),
        ]
        
        for user in demo_users:
            db.add(user)
        
        db.commit()
        
        # Create leaderboard entries
        leaderboard_data = [
            ("NeonViper", 2450, GameModeEnum.walls, 7),
            ("PixelMaster", 2100, GameModeEnum.walls, 6),
            ("SnakeKing", 1890, GameModeEnum.pass_through, 5),
            ("NeonViper", 1750, GameModeEnum.pass_through, 4),
            ("PixelMaster", 1620, GameModeEnum.walls, 3),
        ]
        
        for username, score, mode, days_ago in leaderboard_data:
            user = db.query(User).filter(User.username == username).first()
            if user:
                entry = LeaderboardEntry(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    username=user.username,
                    score=score,
                    mode=mode,
                    avatar=user.avatar,
                    created_at=datetime.utcnow() - timedelta(days=days_ago)
                )
                db.add(entry)
        
        db.commit()
        print("Database seeded successfully!")


if __name__ == "__main__":
    # Initialize and seed database when run directly
    print("Initializing database...")
    init_db()
    seed_database()
    print("Done!")
