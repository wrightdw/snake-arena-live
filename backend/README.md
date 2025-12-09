# Snake Arena Backend

FastAPI backend for Snake Arena Live with mock database.

## Setup

### Dependencies

Using `uv` for dependency management:

```bash
# Sync dependencies from lockfile
uv sync

# Add a new package
uv add <PACKAGE-NAME>
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update environment variables as needed (optional for development)

## Running the Application

### Development Server

```bash
uv run python main.py
```

The API will be available at `http://localhost:8000`

### API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Running Tests

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=app

# Run specific test file
uv run pytest tests/test_api.py

# Run specific test class
uv run pytest tests/test_api.py::TestAuthEndpoints

# Run with verbose output
uv run pytest -v
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── schemas.py           # Pydantic models
│   ├── database.py          # Mock database
│   ├── security.py          # Authentication utilities
│   └── routers/
│       ├── __init__.py
│       ├── auth.py          # Authentication endpoints
│       ├── leaderboard.py   # Leaderboard endpoints
│       └── live.py          # Live players endpoints
├── tests/
│   ├── __init__.py
│   ├── test_api.py          # API endpoint tests
│   └── test_database.py     # Database tests
├── main.py                  # Application entry point
├── pyproject.toml           # Project configuration
├── pytest.ini               # Pytest configuration
├── .env.example             # Environment variables template
└── README.md                # This file
```

## API Endpoints

### Authentication
- `POST /auth/login` - Login user
- `POST /auth/signup` - Create new account
- `GET /auth/me` - Get current user (requires auth)
- `POST /auth/logout` - Logout user (requires auth)

### Leaderboard
- `GET /leaderboard` - Get leaderboard (optional mode filter)
- `POST /leaderboard/submit` - Submit score (requires auth)

### Live Players
- `GET /live/players` - Get list of live players
- `GET /live/players/{player_id}` - Get specific player stream

### Health
- `GET /health` - Health check
- `GET /` - Root endpoint

## Testing

The test suite includes:

1. **API Tests** (`test_api.py`):
   - Authentication endpoints
   - Leaderboard operations
   - Live players endpoints
   - Health checks

2. **Database Tests** (`test_database.py`):
   - User management
   - Leaderboard operations
   - Live player operations
   - Data persistence

All tests use a fresh mock database instance and automatically reset between tests.

## Features

- ✅ JWT-based authentication
- ✅ User registration and login
- ✅ Leaderboard with mode filtering
- ✅ Live player streaming support
- ✅ Mock database (easily replaceable with real DB)
- ✅ Comprehensive test suite
- ✅ CORS support
- ✅ API documentation with Swagger

## Future Improvements

- [ ] Replace mock database with real PostgreSQL
- [ ] Add WebSocket support for real-time updates
- [ ] Add database migrations
- [ ] Add rate limiting
- [ ] Add request validation middleware
- [ ] Add logging
- [ ] Add metrics/monitoring
- [ ] Add email verification
- [ ] Add password reset functionality
