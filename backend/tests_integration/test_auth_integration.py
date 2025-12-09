"""
Integration tests for authentication endpoints.
Tests full authentication flow with SQLite database.
"""
import pytest
from fastapi import status


class TestAuthIntegration:
    """Integration tests for authentication."""
    
    def test_signup_and_login_flow(self, client):
        """Test complete signup and login flow."""
        # Sign up a new user
        signup_data = {
            "username": "NewUser",
            "email": "newuser@example.com",
            "password": "securepassword123"
        }
        
        response = client.post("/auth/signup", json=signup_data)
        assert response.status_code == status.HTTP_200_OK
        
        signup_result = response.json()
        assert signup_result["success"] is True
        assert signup_result["data"]["username"] == "NewUser"
        assert signup_result["data"]["email"] == "newuser@example.com"
        assert "access_token" in signup_result["data"]
        
        # Login with the new user
        login_data = {
            "email": "newuser@example.com",
            "password": "securepassword123"
        }
        
        response = client.post("/auth/login", json=login_data)
        assert response.status_code == status.HTTP_200_OK
        
        login_result = response.json()
        assert login_result["success"] is True
        assert login_result["data"]["username"] == "NewUser"
        assert "access_token" in login_result["data"]
    
    def test_login_with_seeded_user(self, client, seed_test_data):
        """Test login with pre-seeded user."""
        response = client.post(
            "/auth/login",
            json={
                "email": "test1@example.com",
                "password": "password123"
            }
        )
        
        assert response.status_code == status.HTTP_200_OK
        result = response.json()
        assert result["success"] is True
        assert result["data"]["username"] == "TestUser1"
        assert "access_token" in result["data"]
    
    def test_login_invalid_credentials(self, client, seed_test_data):
        """Test login with invalid credentials."""
        response = client.post(
            "/auth/login",
            json={
                "email": "test1@example.com",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        result = response.json()
        assert result["success"] is False
    
    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user."""
        response = client.post(
            "/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "password123"
            }
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        result = response.json()
        assert result["success"] is False
    
    def test_signup_duplicate_email(self, client, seed_test_data):
        """Test signup with duplicate email."""
        response = client.post(
            "/auth/signup",
            json={
                "username": "DuplicateUser",
                "email": "test1@example.com",  # Already exists
                "password": "password123"
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        result = response.json()
        assert result["success"] is False
    
    def test_signup_duplicate_username(self, client, seed_test_data):
        """Test signup with duplicate username."""
        response = client.post(
            "/auth/signup",
            json={
                "username": "TestUser1",  # Already exists
                "email": "unique@example.com",
                "password": "password123"
            }
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        result = response.json()
        assert result["success"] is False
    
    def test_signup_invalid_email(self, client):
        """Test signup with invalid email format."""
        response = client.post(
            "/auth/signup",
            json={
                "username": "ValidUser",
                "email": "not-an-email",
                "password": "password123"
            }
        )
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_me_endpoint_with_auth(self, client, auth_headers, seed_test_data):
        """Test /me endpoint with valid authentication."""
        response = client.get("/auth/me", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        result = response.json()
        assert result["success"] is True
        assert result["data"]["username"] == "TestUser1"
        assert result["data"]["email"] == "test1@example.com"
    
    def test_me_endpoint_without_auth(self, client):
        """Test /me endpoint without authentication."""
        response = client.get("/auth/me")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_me_endpoint_invalid_token(self, client):
        """Test /me endpoint with invalid token."""
        response = client.get(
            "/auth/me",
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
