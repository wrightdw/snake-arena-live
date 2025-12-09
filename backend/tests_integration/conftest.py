"""
Integration test configuration and fixtures.
Uses a separate SQLite database for testing.
"""
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient

from app.main import app
from app.models import Base
from app.db import get_db
from app.security import hash_password

# Use a separate test database
TEST_DATABASE_URL = "sqlite:///./test_snake_arena.db"

# Create test engine
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Create test session factory
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def get_test_db() -> Session:
    """Override database dependency for testing."""
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    # Create all tables
    Base.metadata.create_all(bind=test_engine)
    
    # Create a session
    session = TestSessionLocal()
    
    yield session
    
    # Cleanup
    session.close()
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override."""
    # Override the database dependency
    app.dependency_overrides[get_db] = get_test_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clear overrides
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def seed_test_data(db_session):
    """Seed the test database with sample data."""
    from app.models import User, LeaderboardEntry, GameMode
    from datetime import datetime, timedelta
    
    # Create test users
    users = [
        User(
            username="TestUser1",
            email="test1@example.com",
            password_hash=hash_password("password123")
        ),
        User(
            username="TestUser2",
            email="test2@example.com",
            password_hash=hash_password("password456")
        ),
        User(
            username="TestUser3",
            email="test3@example.com",
            password_hash=hash_password("password789")
        )
    ]
    
    for user in users:
        db_session.add(user)
    
    db_session.commit()
    
    # Refresh to get IDs
    for user in users:
        db_session.refresh(user)
    
    # Create leaderboard entries
    entries = [
        LeaderboardEntry(
            user_id=users[0].id,
            game_mode=GameMode.CLASSIC,
            score=1500,
            achieved_at=datetime.utcnow() - timedelta(days=1)
        ),
        LeaderboardEntry(
            user_id=users[1].id,
            game_mode=GameMode.CLASSIC,
            score=1200,
            achieved_at=datetime.utcnow() - timedelta(days=2)
        ),
        LeaderboardEntry(
            user_id=users[2].id,
            game_mode=GameMode.CLASSIC,
            score=900,
            achieved_at=datetime.utcnow() - timedelta(days=3)
        ),
        LeaderboardEntry(
            user_id=users[0].id,
            game_mode=GameMode.TIMED,
            score=2000,
            achieved_at=datetime.utcnow() - timedelta(hours=5)
        )
    ]
    
    for entry in entries:
        db_session.add(entry)
    
    db_session.commit()
    
    return {
        "users": users,
        "entries": entries
    }


@pytest.fixture(scope="function")
def auth_headers(client, seed_test_data):
    """Get authentication headers for API requests."""
    response = client.post(
        "/auth/login",
        json={
            "email": "test1@example.com",
            "password": "password123"
        }
    )
    
    assert response.status_code == 200
    token = response.json()["data"]["access_token"]
    
    return {"Authorization": f"Bearer {token}"}


def cleanup_test_db():
    """Remove the test database file."""
    if os.path.exists("test_snake_arena.db"):
        os.remove("test_snake_arena.db")
