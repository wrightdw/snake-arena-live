# Backend Development Guidelines (from AGENTS.md)

## Code Organization

- **app/main.py** - FastAPI application setup and router registration
- **app/schemas.py** - Pydantic models for request/response validation
- **app/database.py** - Data access layer (mock for now, will be replaced with real DB)
- **app/security.py** - Authentication and security utilities
- **app/routers/** - API endpoint implementations organized by feature

## Development Workflow

1. **Define schemas first** - Create Pydantic models in `schemas.py`
2. **Implement database layer** - Add methods to `MockDatabase` class
3. **Create routers** - Implement endpoints in `app/routers/`
4. **Write tests** - Create comprehensive tests in `tests/`
5. **Test with API** - Use Swagger UI at `/docs`

## Testing Guidelines

- Every endpoint must have tests
- Every database method must have tests
- Use fixtures for setup/teardown
- Reset database before each test
- Test both success and error cases
- Aim for 100% test coverage

## Adding New Features

### 1. New Endpoint

```python
# app/routers/new_feature.py
from fastapi import APIRouter
from ..schemas import ApiResponse

router = APIRouter(prefix="/feature", tags=["feature"])

@router.get("", response_model=ApiResponse)
async def get_feature():
    return ApiResponse(success=True, data={})
```

### 2. Register Router

```python
# app/main.py
from .routers import new_feature
app.include_router(new_feature.router)
```

### 3. Add Database Methods

```python
# app/database.py
class MockDatabase:
    def get_feature(self):
        pass
```

### 4. Write Tests

```python
# tests/test_new_feature.py
def test_get_feature(client):
    response = client.get("/feature")
    assert response.status_code == 200
```

## Database Migration Path

When switching to PostgreSQL:

1. Create database models in `app/models.py`
2. Create database connection in `app/db.py`
3. Replace `MockDatabase` calls with SQLAlchemy queries
4. Add migrations using Alembic
5. Update connection string in `.env`

Current mock database supports:
- User management
- Leaderboard operations
- Live player data

## Authentication

Currently using:
- JWT tokens for stateless authentication
- Password hashing with bcrypt
- Bearer token in Authorization header

Example:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:8000/auth/me
```

## Deployment

For production:
1. Create proper `.env` file with secure `SECRET_KEY`
2. Update `CORS_ORIGINS` to allowed domains
3. Set `workers` based on server capacity
4. Use production ASGI server (uvicorn in Docker)
5. Add rate limiting and security headers
