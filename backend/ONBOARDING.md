# Developer Onboarding Guide

Welcome to the Snake Arena Backend! This guide helps you get started quickly.

## First Time Setup (5 minutes)

### 1. Prerequisites Check
```bash
python --version  # Should be 3.11+
uv --version      # Should have uv installed
```

### 2. Navigate to Backend
```bash
cd backend
```

### 3. Install Dependencies
```bash
uv sync
```

### 4. Start the Server
```bash
uv run python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### 5. Test the API
Open your browser to: http://localhost:8000/docs

You'll see the Swagger UI with all endpoints documented.

## Understanding the Codebase (15 minutes)

### Project Structure
```
app/
├── main.py         # Application entry point
├── schemas.py      # Data models (request/response)
├── database.py     # Data access layer
├── security.py     # Authentication utilities
└── routers/        # API endpoints organized by feature
    ├── auth.py         # User registration & login
    ├── leaderboard.py  # Score & ranking
    └── live.py         # Live player streams

tests/
├── test_api.py      # API endpoint tests
└── test_database.py # Database operation tests
```

### Key Files to Review

1. **Start here: `app/main.py`**
   - Understand the FastAPI app setup
   - See how routers are registered
   - CORS configuration

2. **Then: `app/schemas.py`**
   - Review data models
   - Understand request/response formats
   - See validation rules

3. **Next: `app/database.py`**
   - Understand data access layer
   - See mock data structure
   - Learn about database methods

4. **Finally: `app/routers/`**
   - Review endpoint implementations
   - Understand authentication flow
   - See error handling patterns

## Common Tasks

### Run Tests
```bash
# All tests
uv run pytest

# With coverage
uv run pytest --cov=app

# Specific test file
uv run pytest tests/test_api.py -v

# Specific test
uv run pytest tests/test_api.py::TestAuthEndpoints::test_login_success -v
```

### Test API Manually
```bash
# Using provided script
bash test-api.sh

# Or with curl
curl http://localhost:8000/health
```

### View API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Add New Endpoint

Example: Adding a new endpoint to get user stats.

#### 1. Create Schema (`app/schemas.py`)
```python
class UserStats(BaseModel):
    user_id: str
    games_played: int
    total_score: int
    best_score: int
```

#### 2. Add Database Method (`app/database.py`)
```python
def get_user_stats(self, user_id: str) -> dict:
    """Get user game statistics."""
    user = self.get_user_by_id(user_id)
    if not user:
        raise ValueError("User not found")
    # Return stats
    return {"user_id": user_id, "games_played": 10, ...}
```

#### 3. Create Router (`app/routers/stats.py`)
```python
from fastapi import APIRouter
from ..database import db

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/user/{user_id}")
async def get_user_stats(user_id: str):
    try:
        stats = db.get_user_stats(user_id)
        return ApiResponse(success=True, data=stats)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
```

#### 4. Register Router (`app/main.py`)
```python
from .routers import stats
app.include_router(stats.router)
```

#### 5. Write Tests (`tests/test_stats.py`)
```python
def test_get_user_stats(client):
    response = client.get("/stats/user/1")
    assert response.status_code == 200
    assert "games_played" in response.json()["data"]
```

### Environment Configuration

Copy `.env.example` to `.env` and modify as needed:
```bash
cp .env.example .env
```

Common variables:
- `SECRET_KEY` - Change in production
- `API_PORT` - Server port (default: 8000)
- `API_HOST` - Server address (default: 0.0.0.0)
- `CORS_ORIGINS` - Allowed frontend URLs

## Understanding Authentication

### How It Works

1. **User Sign Up**
   - POST `/auth/signup` with credentials
   - Password is hashed with bcrypt
   - JWT token is generated and returned

2. **User Login**
   - POST `/auth/login` with email & password
   - Password verified against hash
   - JWT token is generated and returned

3. **Protected Requests**
   - Include token in header: `Authorization: Bearer <token>`
   - Token is validated before endpoint executes
   - Request includes authenticated user info

### Example Authentication Flow

```bash
# 1. Sign up
TOKEN=$(curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"player","email":"player@example.com","password":"secret"}' \
  | jq -r '.data.access_token')

# 2. Use token for protected request
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## Database Migration (Future)

When switching to PostgreSQL:

1. **Install dependencies**
   ```bash
   uv add sqlalchemy psycopg2-binary alembic
   ```

2. **Create models** in `app/models.py` (SQLAlchemy)

3. **Create database connection** in `app/db.py`

4. **Replace MockDatabase** calls with SQLAlchemy queries

5. **Create migrations** with Alembic

The current structure makes this migration straightforward because:
- All data access goes through `MockDatabase` methods
- Schemas are separate from implementation
- Tests are abstracted from database layer

## Troubleshooting

### Import Errors
```
ModuleNotFoundError: No module named 'app'
```
**Solution:** Make sure you're in the `backend` directory before running commands.

### Port Already in Use
```
OSError: [Errno 48] Address already in use
```
**Solution:** Change `API_PORT` in `.env` or kill process using port 8000:
```bash
# macOS/Linux
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Tests Failing
```
ImportError when running pytest
```
**Solution:** Make sure you're in the `backend` directory and ran `uv sync`:
```bash
cd backend
uv sync
uv run pytest
```

## Documentation Reference

| Document | Purpose |
|----------|---------|
| `README.md` | Project overview |
| `QUICKSTART.md` | Quick reference |
| `API_SPEC.md` | Complete API specification |
| `AGENTS.md` | Development guidelines |
| `CHECKLIST.md` | Implementation checklist |
| This file | Onboarding guide |

## Getting Help

### Within the Code
- All functions have docstrings
- Type hints show expected types
- Error messages are descriptive

### API Testing
- Swagger UI at http://localhost:8000/docs
- ReDoc at http://localhost:8000/redoc
- `test-api.sh` script with examples

### Understanding Patterns
- Look at `TestAuthEndpoints` in `test_api.py` for examples
- See `test_database.py` for database patterns
- Review `app/routers/auth.py` for endpoint patterns

## Development Workflow

### Daily Workflow
```bash
# 1. Start server
uv run python main.py

# 2. In another terminal, make changes to code
# (Server will auto-reload)

# 3. Run tests
uv run pytest

# 4. Test with browser
# Visit http://localhost:8000/docs
```

### Before Committing
```bash
# 1. Run all tests
uv run pytest

# 2. Check code
python -m py_compile app/*.py app/routers/*.py

# 3. View test coverage
uv run pytest --cov=app
```

## Next Challenges

After understanding the current implementation:

1. **Add a new feature** - Create endpoints for user profiles
2. **Modify database** - Add new fields to leaderboard entries
3. **Extend tests** - Add edge case tests
4. **Optimize code** - Improve database query efficiency
5. **Plan migration** - Design PostgreSQL schema

## Questions?

Refer to:
- **How do I...?** → Check `QUICKSTART.md`
- **What's the API format?** → Check `API_SPEC.md`
- **How should I code this?** → Check `AGENTS.md`
- **Is feature X done?** → Check `CHECKLIST.md`

---

**You're ready to start developing!** 🚀

For any issues, check the troubleshooting section or review the relevant documentation file.
