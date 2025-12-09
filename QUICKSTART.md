# 🚀 Quick Start Guide

Get Snake Arena Live up and running in 5 minutes!

## Option 1: Docker (Recommended)

### Prerequisites
- Docker Desktop or Docker Engine
- Docker Compose

### Steps

1. **Clone and navigate to the project**
```bash
cd /workspaces/snake-arena-live
```

2. **Environment file is already created** (`.env`)
   - Default credentials are set for development
   - For production, update passwords in `.env`

3. **Start everything with one command**
```bash
docker-compose up --build
```

Or use the Makefile:
```bash
make build
make up
```

4. **Wait for services to start** (about 30-60 seconds)
   - Watch the logs for "Application startup complete"
   - Backend initializes the database automatically

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

6. **Create an account and play!**

### Useful Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Clean everything (including database)
docker-compose down -v
```

Or with Makefile:
```bash
make logs          # View all logs
make logs-backend  # View backend logs
make down          # Stop services
make restart       # Restart services
make clean         # Remove everything
```

## Option 2: Local Development

### Prerequisites
- Node.js 20+
- Python 3.12+
- PostgreSQL (or use Docker for database only)

### Backend Setup

1. **Install dependencies**
```bash
cd backend
pip install uvicorn fastapi sqlalchemy psycopg2-binary pydantic python-jose passlib bcrypt email-validator python-dotenv
```

2. **Set up database**
```bash
# Option A: Use Docker for PostgreSQL only
docker run -d \
  --name snake-postgres \
  -e POSTGRES_USER=snakearena \
  -e POSTGRES_PASSWORD=changeme123 \
  -e POSTGRES_DB=snake_arena_db \
  -p 5432:5432 \
  postgres:16-alpine

# Option B: Install PostgreSQL locally
# Then create database manually
```

3. **Run backend**
```bash
cd backend
python main.py
```

Backend runs on http://localhost:8000

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Run frontend**
```bash
npm run dev
```

Frontend runs on http://localhost:5173

### Run Both Concurrently

```bash
cd frontend
npm run dev:all
```

This runs both frontend and backend together.

## Testing the Application

### 1. Create an Account
- Click "Sign Up" in the header
- Enter username, email, and password
- You'll be automatically logged in

### 2. Play the Game
- Select a game mode (Classic, Timed, or Survival)
- Use WASD or Arrow keys to control the snake
- Try to get a high score!

### 3. View Leaderboards
- Click "Leaderboard" in the navigation
- See top scores for each game mode
- Your scores appear automatically after playing

### 4. Watch Live Players
- Click "Watch" in the navigation
- See other players currently playing
- Watch their games in real-time (when implemented)

## Troubleshooting

### Port Already in Use

If ports 3000, 8000, or 5432 are taken:

**Edit `docker-compose.yml`:**
```yaml
ports:
  - "3001:80"      # Change 3000 to 3001
  - "8001:8000"    # Change 8000 to 8001
  - "5433:5432"    # Change 5432 to 5433
```

### Database Connection Errors

**Check database is running:**
```bash
docker-compose ps
```

**Restart services:**
```bash
docker-compose restart
```

### Frontend Can't Connect to Backend

**Check VITE_API_URL in `.env`:**
```env
VITE_API_URL=http://localhost:8000
```

**Rebuild frontend:**
```bash
docker-compose up --build frontend
```

### Permission Errors (Linux)

```bash
sudo chown -R $USER:$USER .
```

## Next Steps

- Read the full [README.md](../README.md) for detailed documentation
- Check [docker/README.md](../docker/README.md) for Docker details
- Explore API docs at http://localhost:8000/docs
- Run tests: `make test-backend` or `make test-frontend`

## Quick Reference

### Makefile Commands
```bash
make help          # Show all available commands
make up            # Start services
make down          # Stop services
make logs          # View logs
make shell-backend # Open backend shell
make shell-db      # Open database shell
make test-backend  # Run tests
make clean         # Clean everything
```

### Default Credentials (Development)

**Database:**
- User: `snakearena`
- Password: `changeme123`
- Database: `snake_arena_db`

**Sample Users** (created automatically):
- Email: `user1@example.com`, Password: `password123`
- Email: `user2@example.com`, Password: `password123`
- Email: `user3@example.com`, Password: `password123`

**⚠️ Change these in production!**

## Support

- Check the [README.md](../README.md) for full documentation
- Review [API documentation](http://localhost:8000/docs) when running
- Check Docker logs: `make logs`
