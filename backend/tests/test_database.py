import pytest
from app.database import MockDatabase


@pytest.fixture
def mock_db():
    """Create a fresh mock database for testing."""
    db = MockDatabase()
    return db


class TestMockDatabase:
    def test_initial_users(self, mock_db):
        """Test initial users are loaded."""
        assert len(mock_db.users) == 2
        assert "user1@example.com" in mock_db.users
        assert "user2@example.com" in mock_db.users

    def test_get_user_by_email(self, mock_db):
        """Test retrieving user by email."""
        user = mock_db.get_user_by_email("user1@example.com")
        assert user is not None
        assert user["username"] == "PixelMaster"
        assert user["email"] == "user1@example.com"

    def test_get_user_by_email_not_found(self, mock_db):
        """Test retrieving non-existent user by email."""
        user = mock_db.get_user_by_email("nonexistent@example.com")
        assert user is None

    def test_get_user_by_id(self, mock_db):
        """Test retrieving user by ID."""
        user = mock_db.get_user_by_id("1")
        assert user is not None
        assert user["username"] == "PixelMaster"

    def test_get_user_by_id_not_found(self, mock_db):
        """Test retrieving non-existent user by ID."""
        user = mock_db.get_user_by_id("999")
        assert user is None

    def test_create_user(self, mock_db):
        """Test creating a new user."""
        user = mock_db.create_user(
            username="NewPlayer",
            email="new@example.com",
            password="password123",
        )
        assert user["username"] == "NewPlayer"
        assert user["email"] == "new@example.com"
        assert "password_hash" in user

    def test_create_user_duplicate_email(self, mock_db):
        """Test creating user with existing email raises error."""
        with pytest.raises(ValueError):
            mock_db.create_user(
                username="AnotherUser",
                email="user1@example.com",
                password="password123",
            )

    def test_verify_password(self, mock_db):
        """Test password verification."""
        user = mock_db.get_user_by_email("user1@example.com")
        assert mock_db.verify_password("password123", user["password_hash"]) is True
        assert mock_db.verify_password("wrongpassword", user["password_hash"]) is False

    def test_get_leaderboard(self, mock_db):
        """Test retrieving leaderboard."""
        entries = mock_db.get_leaderboard()
        assert len(entries) == 5
        # Check sorted by score descending
        scores = [e["score"] for e in entries]
        assert scores == sorted(scores, reverse=True)

    def test_get_leaderboard_by_mode(self, mock_db):
        """Test retrieving leaderboard filtered by mode."""
        entries = mock_db.get_leaderboard(mode="walls")
        assert all(e["mode"] == "walls" for e in entries)

        entries = mock_db.get_leaderboard(mode="pass-through")
        assert all(e["mode"] == "pass-through" for e in entries)

    def test_submit_score(self, mock_db):
        """Test submitting a score."""
        initial_count = len(mock_db.leaderboard)
        entry = mock_db.submit_score(user_id="1", score=5000, mode="walls")
        assert entry["score"] == 5000
        assert entry["mode"] == "walls"
        assert entry["username"] == "PixelMaster"
        assert len(mock_db.leaderboard) == initial_count + 1

    def test_submit_score_user_not_found(self, mock_db):
        """Test submitting score for non-existent user."""
        with pytest.raises(ValueError):
            mock_db.submit_score(user_id="999", score=100, mode="walls")

    def test_leaderboard_reranking(self, mock_db):
        """Test that leaderboard is re-ranked after new submission."""
        mock_db.submit_score(user_id="1", score=99999, mode="walls")
        entries = mock_db.get_leaderboard(mode="walls")
        # Highest score should be rank 1
        assert entries[0]["score"] == 99999
        assert entries[0]["rank"] == 1

    def test_get_live_players(self, mock_db):
        """Test retrieving live players."""
        players = mock_db.get_live_players()
        assert len(players) >= 2

    def test_get_player_stream(self, mock_db):
        """Test retrieving specific player stream."""
        player = mock_db.get_player_stream("live1")
        assert player is not None
        assert player["id"] == "live1"
        assert player["username"] == "StreamerPro"

    def test_get_player_stream_not_found(self, mock_db):
        """Test retrieving non-existent player."""
        player = mock_db.get_player_stream("nonexistent")
        assert player is None

    def test_update_live_player(self, mock_db):
        """Test updating a live player."""
        updated = mock_db.update_live_player("live1", {"score": 999, "viewers": 100})
        assert updated is not None
        assert updated["score"] == 999
        assert updated["viewers"] == 100

    def test_update_live_player_not_found(self, mock_db):
        """Test updating non-existent player."""
        updated = mock_db.update_live_player("nonexistent", {"score": 100})
        assert updated is None

    def test_reset_database(self, mock_db):
        """Test database reset."""
        # Modify data
        mock_db.create_user("TestUser", "test@example.com", "password")
        mock_db.submit_score("1", 9999, "walls")

        # Reset
        mock_db.reset()

        # Verify reset
        assert len(mock_db.users) == 2
        assert "test@example.com" not in mock_db.users
        assert len(mock_db.leaderboard) == 5
