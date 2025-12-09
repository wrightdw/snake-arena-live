import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import db


@pytest.fixture(autouse=True)
def reset_db():
    """Reset database before each test."""
    db.reset()
    yield
    db.reset()


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def auth_token(client):
    """Get authentication token for testing."""
    response = client.post(
        "/auth/login",
        json={"email": "user1@example.com", "password": "password123"},
    )
    return response.json()["data"]["access_token"]


# Auth Tests
class TestAuthEndpoints:
    def test_login_success(self, client):
        response = client.post(
            "/auth/login",
            json={"email": "user1@example.com", "password": "password123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["username"] == "PixelMaster"
        assert "access_token" in data["data"]

    def test_login_invalid_email(self, client):
        response = client.post(
            "/auth/login",
            json={"email": "invalid@example.com", "password": "password123"},
        )
        assert response.status_code == 401

    def test_login_invalid_password(self, client):
        response = client.post(
            "/auth/login",
            json={"email": "user1@example.com", "password": "wrongpassword"},
        )
        assert response.status_code == 401

    def test_signup_success(self, client):
        response = client.post(
            "/auth/signup",
            json={
                "username": "NewPlayer",
                "email": "newplayer@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["username"] == "NewPlayer"
        assert data["data"]["email"] == "newplayer@example.com"
        assert "access_token" in data["data"]

    def test_signup_existing_email(self, client):
        response = client.post(
            "/auth/signup",
            json={
                "username": "AnotherUser",
                "email": "user1@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 400

    def test_get_current_user(self, client, auth_token):
        response = client.get(
            "/auth/me", headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["username"] == "PixelMaster"
        assert data["data"]["email"] == "user1@example.com"

    def test_get_current_user_no_token(self, client):
        response = client.get("/auth/me")
        assert response.status_code == 403

    def test_get_current_user_invalid_token(self, client):
        response = client.get(
            "/auth/me", headers={"Authorization": "Bearer invalid-token"}
        )
        assert response.status_code == 401

    def test_logout(self, client, auth_token):
        response = client.post(
            "/auth/logout", headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert response.json()["success"] is True


# Leaderboard Tests
class TestLeaderboardEndpoints:
    def test_get_leaderboard(self, client):
        response = client.get("/leaderboard")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "entries" in data["data"]
        assert len(data["data"]["entries"]) > 0

    def test_get_leaderboard_by_mode_walls(self, client):
        response = client.get("/leaderboard?mode=walls")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        entries = data["data"]["entries"]
        assert all(e["mode"] == "walls" for e in entries)

    def test_get_leaderboard_by_mode_pass_through(self, client):
        response = client.get("/leaderboard?mode=pass-through")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        entries = data["data"]["entries"]
        assert all(e["mode"] == "pass-through" for e in entries)

    def test_submit_score_success(self, client, auth_token):
        response = client.post(
            "/leaderboard/submit?score=500&mode=walls",
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["score"] == 500

    def test_submit_score_no_auth(self, client):
        response = client.post("/leaderboard/submit?score=500&mode=walls")
        assert response.status_code == 403

    def test_submit_score_invalid_mode(self, client, auth_token):
        response = client.post(
            "/leaderboard/submit?score=500&mode=invalid",
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        assert response.status_code == 400

    def test_submit_score_negative(self, client, auth_token):
        response = client.post(
            "/leaderboard/submit?score=-10&mode=walls",
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        assert response.status_code == 400

    def test_leaderboard_is_sorted(self, client):
        response = client.get("/leaderboard")
        data = response.json()
        entries = data["data"]["entries"]
        scores = [e["score"] for e in entries]
        assert scores == sorted(scores, reverse=True)


# Live Players Tests
class TestLivePlayersEndpoints:
    def test_get_live_players(self, client):
        response = client.get("/live/players")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "players" in data["data"]
        assert len(data["data"]["players"]) > 0

    def test_get_live_players_fields(self, client):
        response = client.get("/live/players")
        data = response.json()
        players = data["data"]["players"]
        required_fields = [
            "id",
            "username",
            "score",
            "mode",
            "snake",
            "food",
            "direction",
            "status",
            "viewers",
        ]
        for player in players:
            for field in required_fields:
                assert field in player

    def test_get_player_stream(self, client):
        response = client.get("/live/players/live1")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["id"] == "live1"
        assert data["data"]["username"] == "StreamerPro"

    def test_get_player_stream_not_found(self, client):
        response = client.get("/live/players/nonexistent")
        assert response.status_code == 404


# Health Check
class TestHealthCheck:
    def test_health_check(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_root_endpoint(self, client):
        response = client.get("/")
        assert response.status_code == 200
        assert "message" in response.json()
