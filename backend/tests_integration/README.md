# Integration Tests

This directory contains integration tests for the Snake Arena backend API using SQLite database.

## Overview

Integration tests verify the complete functionality of the API endpoints with a real database. Unlike unit tests that may use mocks, these tests:

- Use a separate SQLite database (`test_snake_arena.db`)
- Test full request/response cycles through FastAPI
- Verify database operations (create, read, update)
- Test authentication and authorization flows
- Validate data persistence across requests

## Test Structure

```
tests_integration/
├── __init__.py
├── conftest.py                      # Test fixtures and configuration
├── test_auth_integration.py         # Authentication endpoint tests
├── test_leaderboard_integration.py  # Leaderboard endpoint tests
└── test_live_integration.py         # Live/spectator endpoint tests
```

## Fixtures

Defined in `conftest.py`:

- `db_session`: Fresh database session for each test
- `client`: FastAPI TestClient with database override
- `seed_test_data`: Populate database with sample users and scores
- `auth_headers`: Authenticated request headers

## Running Tests

### Run all integration tests:
```bash
cd backend
pytest tests_integration/
```

### Run specific test file:
```bash
pytest tests_integration/test_auth_integration.py
```

### Run specific test:
```bash
pytest tests_integration/test_auth_integration.py::TestAuthIntegration::test_signup_and_login_flow
```

### Run with verbose output:
```bash
pytest tests_integration/ -v
```

### Run with coverage:
```bash
pytest tests_integration/ --cov=app --cov-report=html
```

## Test Categories

### Authentication Tests (`test_auth_integration.py`)
- User signup and login flow
- Token generation and validation
- Duplicate user handling
- Invalid credentials
- /me endpoint authorization

### Leaderboard Tests (`test_leaderboard_integration.py`)
- Retrieving leaderboards by game mode
- Submitting scores (authenticated)
- Score ordering and limits
- Multiple scores per user
- Invalid input handling

### Live Session Tests (`test_live_integration.py`)
- Live player tracking
- Multiple concurrent players
- State updates and persistence
- Game over handling
- Stream data retrieval

## Database

Tests use a separate SQLite database (`test_snake_arena.db`) that is:
- Created fresh for each test function
- Dropped after each test completes
- Automatically cleaned up

This ensures test isolation and prevents test data pollution.

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Clean State**: Use fixtures to set up fresh data for each test
3. **Assertions**: Verify both status codes and response content
4. **Coverage**: Test both success and error cases
5. **Cleanup**: Database is automatically cleaned between tests

## Adding New Tests

To add new integration tests:

1. Create a new test file: `test_<feature>_integration.py`
2. Import necessary fixtures from `conftest.py`
3. Create test class: `class TestFeatureIntegration:`
4. Write test methods starting with `test_`
5. Use fixtures for setup (client, auth_headers, seed_test_data)

Example:
```python
class TestNewFeatureIntegration:
    def test_feature_success(self, client, auth_headers):
        response = client.get("/api/endpoint", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["success"] is True
```

## Troubleshooting

### Database locked errors
If you see "database is locked" errors, ensure:
- Tests are properly cleaning up database connections
- No other process is using the test database

### Import errors
Make sure you're running pytest from the `backend` directory:
```bash
cd backend
pytest tests_integration/
```

### Fixture errors
If fixtures aren't working, verify:
- `conftest.py` is in the `tests_integration` directory
- Pytest can discover the conftest file
- All required dependencies are installed
