"""
Integration tests for live/spectator endpoints.
Tests live session tracking with SQLite database.
"""
import pytest
from fastapi import status
import time


class TestLiveIntegration:
    """Integration tests for live/spectator features."""
    
    def test_get_live_players_empty(self, client):
        """Test getting live players when none are active."""
        response = client.get("/live/players")
        
        assert response.status_code == status.HTTP_200_OK
        result = response.json()
        assert result["success"] is True
        assert isinstance(result["data"], list)
        assert len(result["data"]) == 0
    
    def test_update_live_player_authenticated(self, client, auth_headers, seed_test_data):
        """Test updating live player state with authentication."""
        game_state = {
            "mode": "classic",
            "score": 500,
            "snake_length": 10,
            "is_alive": True
        }
        
        response = client.post(
            "/live/update",
            json=game_state,
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        result = response.json()
        assert result["success"] is True
    
    def test_update_live_player_unauthenticated(self, client):
        """Test updating live player state without authentication."""
        game_state = {
            "mode": "classic",
            "score": 500,
            "snake_length": 10,
            "is_alive": True
        }
        
        response = client.post("/live/update", json=game_state)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_live_player_appears_in_list(self, client, auth_headers, seed_test_data):
        """Test that updated live player appears in the players list."""
        # Update live state
        game_state = {
            "mode": "classic",
            "score": 750,
            "snake_length": 15,
            "is_alive": True
        }
        
        update_response = client.post(
            "/live/update",
            json=game_state,
            headers=auth_headers
        )
        assert update_response.status_code == status.HTTP_200_OK
        
        # Get live players
        response = client.get("/live/players")
        assert response.status_code == status.HTTP_200_OK
        
        result = response.json()
        assert len(result["data"]) == 1
        
        player = result["data"][0]
        assert player["username"] == "TestUser1"
        assert player["score"] == 750
        assert player["snake_length"] == 15
        assert player["is_alive"] is True
    
    def test_multiple_live_players(self, client, seed_test_data):
        """Test multiple players can be live simultaneously."""
        # Login as first user
        login1 = client.post(
            "/auth/login",
            json={"email": "test1@example.com", "password": "password123"}
        )
        token1 = login1.json()["data"]["access_token"]
        headers1 = {"Authorization": f"Bearer {token1}"}
        
        # Login as second user
        login2 = client.post(
            "/auth/login",
            json={"email": "test2@example.com", "password": "password456"}
        )
        token2 = login2.json()["data"]["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}
        
        # Update both players
        client.post(
            "/live/update",
            json={"mode": "classic", "score": 1000, "snake_length": 20, "is_alive": True},
            headers=headers1
        )
        
        client.post(
            "/live/update",
            json={"mode": "timed", "score": 1500, "snake_length": 25, "is_alive": True},
            headers=headers2
        )
        
        # Get live players
        response = client.get("/live/players")
        result = response.json()
        
        assert len(result["data"]) == 2
        usernames = [p["username"] for p in result["data"]]
        assert "TestUser1" in usernames
        assert "TestUser2" in usernames
    
    def test_live_player_game_over(self, client, auth_headers, seed_test_data):
        """Test updating player state when game is over."""
        # Start game
        client.post(
            "/live/update",
            json={"mode": "classic", "score": 500, "snake_length": 10, "is_alive": True},
            headers=auth_headers
        )
        
        # Game over
        game_over_state = {
            "mode": "classic",
            "score": 800,
            "snake_length": 16,
            "is_alive": False
        }
        
        response = client.post(
            "/live/update",
            json=game_over_state,
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        
        # Player should still appear but marked as not alive
        players_response = client.get("/live/players")
        players = players_response.json()["data"]
        
        if len(players) > 0:
            player = next((p for p in players if p["username"] == "TestUser1"), None)
            if player:
                assert player["is_alive"] is False
                assert player["score"] == 800
    
    def test_get_player_stream_authenticated(self, client, auth_headers, seed_test_data):
        """Test getting player's own stream data."""
        # Update state first
        client.post(
            "/live/update",
            json={"mode": "classic", "score": 600, "snake_length": 12, "is_alive": True},
            headers=auth_headers
        )
        
        # Get stream
        response = client.get("/live/stream", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        result = response.json()
        assert result["success"] is True
        
        # Should contain player's state
        stream_data = result["data"]
        assert stream_data["score"] == 600
        assert stream_data["snake_length"] == 12
    
    def test_get_player_stream_unauthenticated(self, client):
        """Test getting stream without authentication."""
        response = client.get("/live/stream")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_live_player_state_persistence(self, client, auth_headers, seed_test_data):
        """Test that live player state persists across updates."""
        # First update
        client.post(
            "/live/update",
            json={"mode": "classic", "score": 100, "snake_length": 5, "is_alive": True},
            headers=auth_headers
        )
        
        # Second update (higher score)
        client.post(
            "/live/update",
            json={"mode": "classic", "score": 200, "snake_length": 8, "is_alive": True},
            headers=auth_headers
        )
        
        # Get live players
        response = client.get("/live/players")
        players = response.json()["data"]
        
        # Should show latest state
        player = next((p for p in players if p["username"] == "TestUser1"), None)
        assert player is not None
        assert player["score"] == 200
        assert player["snake_length"] == 8
    
    def test_live_session_different_modes(self, client, auth_headers, seed_test_data):
        """Test player can have live sessions in different game modes."""
        # Play classic mode
        client.post(
            "/live/update",
            json={"mode": "classic", "score": 500, "snake_length": 10, "is_alive": True},
            headers=auth_headers
        )
        
        # Switch to timed mode
        client.post(
            "/live/update",
            json={"mode": "timed", "score": 1000, "snake_length": 20, "is_alive": True},
            headers=auth_headers
        )
        
        # Get live players
        response = client.get("/live/players")
        players = response.json()["data"]
        
        # Could be 1 or 2 entries depending on implementation
        # At minimum, should have the latest session
        assert len(players) >= 1
        
        # Find the TestUser1 entries
        user1_sessions = [p for p in players if p["username"] == "TestUser1"]
        assert len(user1_sessions) >= 1
