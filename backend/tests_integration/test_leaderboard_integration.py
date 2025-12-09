"""
Integration tests for leaderboard endpoints.
Tests leaderboard operations with SQLite database.
"""
import pytest
from fastapi import status


class TestLeaderboardIntegration:
    """Integration tests for leaderboard."""
    
    def test_get_leaderboard_classic_mode(self, client, seed_test_data):
        """Test retrieving classic mode leaderboard."""
        response = client.get("/leaderboard/classic")
        
        assert response.status_code == status.HTTP_200_OK
        result = response.json()
        assert result["success"] is True
        assert isinstance(result["data"], list)
        assert len(result["data"]) == 3
        
        # Check ordering (highest score first)
        scores = [entry["score"] for entry in result["data"]]
        assert scores == sorted(scores, reverse=True)
        
        # Check first entry
        assert result["data"][0]["username"] == "TestUser1"
        assert result["data"][0]["score"] == 1500
    
    def test_get_leaderboard_timed_mode(self, client, seed_test_data):
        """Test retrieving timed mode leaderboard."""
        response = client.get("/leaderboard/timed")
        
        assert response.status_code == status.HTTP_200_OK
        result = response.json()
        assert result["success"] is True
        assert isinstance(result["data"], list)
        assert len(result["data"]) == 1
        
        assert result["data"][0]["username"] == "TestUser1"
        assert result["data"][0]["score"] == 2000
    
    def test_get_leaderboard_survival_mode(self, client, seed_test_data):
        """Test retrieving survival mode leaderboard (empty)."""
        response = client.get("/leaderboard/survival")
        
        assert response.status_code == status.HTTP_200_OK
        result = response.json()
        assert result["success"] is True
        assert isinstance(result["data"], list)
        assert len(result["data"]) == 0
    
    def test_submit_score_authenticated(self, client, auth_headers, seed_test_data):
        """Test submitting a score with authentication."""
        score_data = {
            "mode": "classic",
            "score": 2500
        }
        
        response = client.post(
            "/leaderboard/submit",
            json=score_data,
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        result = response.json()
        assert result["success"] is True
        
        # Verify the score was added to leaderboard
        leaderboard_response = client.get("/leaderboard/classic")
        leaderboard = leaderboard_response.json()["data"]
        
        # New score should be at the top
        assert leaderboard[0]["username"] == "TestUser1"
        assert leaderboard[0]["score"] == 2500
    
    def test_submit_score_unauthenticated(self, client):
        """Test submitting a score without authentication."""
        score_data = {
            "mode": "classic",
            "score": 2500
        }
        
        response = client.post("/leaderboard/submit", json=score_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_submit_multiple_scores_same_user(self, client, auth_headers, seed_test_data):
        """Test submitting multiple scores for the same user."""
        # Submit first score
        response1 = client.post(
            "/leaderboard/submit",
            json={"mode": "timed", "score": 3000},
            headers=auth_headers
        )
        assert response1.status_code == status.HTTP_200_OK
        
        # Submit second score (higher)
        response2 = client.post(
            "/leaderboard/submit",
            json={"mode": "timed", "score": 3500},
            headers=auth_headers
        )
        assert response2.status_code == status.HTTP_200_OK
        
        # Check leaderboard
        leaderboard_response = client.get("/leaderboard/timed")
        leaderboard = leaderboard_response.json()["data"]
        
        # Should have multiple entries for the same user
        user1_entries = [e for e in leaderboard if e["username"] == "TestUser1"]
        assert len(user1_entries) >= 2
        
        # Highest score should be first
        assert leaderboard[0]["score"] == 3500
    
    def test_submit_score_invalid_mode(self, client, auth_headers, seed_test_data):
        """Test submitting a score with invalid game mode."""
        score_data = {
            "mode": "invalid_mode",
            "score": 1000
        }
        
        response = client.post(
            "/leaderboard/submit",
            json=score_data,
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_submit_score_negative(self, client, auth_headers, seed_test_data):
        """Test submitting a negative score."""
        score_data = {
            "mode": "classic",
            "score": -100
        }
        
        response = client.post(
            "/leaderboard/submit",
            json=score_data,
            headers=auth_headers
        )
        
        # Should either reject or accept (depending on validation)
        # Current schema should reject negative scores
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_leaderboard_ordering(self, client, auth_headers, seed_test_data):
        """Test that leaderboard entries are properly ordered by score."""
        # Add more scores
        scores = [800, 1600, 1100, 2200]
        
        for score in scores:
            client.post(
                "/leaderboard/submit",
                json={"mode": "classic", "score": score},
                headers=auth_headers
            )
        
        # Get leaderboard
        response = client.get("/leaderboard/classic")
        leaderboard = response.json()["data"]
        
        # Verify ordering
        scores_in_leaderboard = [entry["score"] for entry in leaderboard]
        assert scores_in_leaderboard == sorted(scores_in_leaderboard, reverse=True)
        
        # Highest score should be first
        assert leaderboard[0]["score"] == 2200
    
    def test_leaderboard_limit(self, client, seed_test_data):
        """Test leaderboard entry limit (top 10)."""
        # Create a new user and add 15 scores
        signup_response = client.post(
            "/auth/signup",
            json={
                "username": "LeaderboardTester",
                "email": "tester@example.com",
                "password": "password123"
            }
        )
        token = signup_response.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Submit 15 different scores
        for i in range(15):
            client.post(
                "/leaderboard/submit",
                json={"mode": "classic", "score": (i + 1) * 100},
                headers=headers
            )
        
        # Get leaderboard
        response = client.get("/leaderboard/classic")
        leaderboard = response.json()["data"]
        
        # Should return top 10 entries
        assert len(leaderboard) <= 10
