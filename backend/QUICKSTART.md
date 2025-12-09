# Quick Start Guide for Backend

## Prerequisites

- Python 3.11+
- `uv` package manager

## Installation

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Sync dependencies:**
```bash
uv sync
```

3. **Copy environment file:**
```bash
cp .env.example .env
```

## Running the Server

```bash
uv run python main.py
```

The server will start at `http://localhost:8000`

### Access Points:
- **API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Running Tests

```bash
# Run all tests
uv run pytest

# Run with coverage report
uv run pytest --cov=app tests/

# Run specific test file
uv run pytest tests/test_api.py -v
```

## Example API Calls

### Signup
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player1",
    "email": "player1@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "password123"
  }'
```

### Get Leaderboard
```bash
curl http://localhost:8000/leaderboard
```

### Submit Score (requires auth)
```bash
curl -X POST "http://localhost:8000/leaderboard/submit?score=500&mode=walls" \
  -H "Authorization: Bearer <token>"
```

### Get Live Players
```bash
curl http://localhost:8000/live/players
```

## Database

Currently using mock in-memory database. To switch to PostgreSQL:

1. Update dependencies in `pyproject.toml`:
   - Add `sqlalchemy`
   - Add `psycopg2-binary` or `asyncpg`

2. Create database models in `app/models.py`

3. Create database connection in `app/db.py`

4. Replace `MockDatabase` with SQLAlchemy queries

See `AGENTS.md` for more details.
