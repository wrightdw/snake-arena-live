# 🐍 Snake Arena Live

A modern, full-stack multiplayer snake game with real-time leaderboards and live spectator mode.

## 🎮 Features

- **Classic Snake Gameplay**: Three game modes (Classic, Timed, Survival)
- **User Authentication**: Secure signup/login with JWT tokens
- **Global Leaderboards**: Track high scores across all game modes
- **Live Spectator Mode**: Watch other players in real-time
- **Responsive Design**: Beautiful UI with shadcn/ui components
- **Real-time Updates**: Live player tracking and score updates

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **shadcn/ui** component library
- **TailwindCSS** for styling
- **React Router** for navigation
- **Vitest** for testing

### Backend
- **FastAPI** (Python 3.12)
- **SQLAlchemy ORM** with PostgreSQL/SQLite support
- **JWT Authentication** with bcrypt password hashing
- **Pydantic** for data validation
- **pytest** for testing

### Database
- **PostgreSQL** (production)
- **SQLite** (development/testing)

### Deployment
- **Docker Compose** for orchestration
- **Nginx** for serving frontend
- **PostgreSQL** container for data persistence

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd snake-arena-live
```

2. **Create environment file**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start all services**
```bash
docker-compose up --build
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Local Development

#### Prerequisites
- Node.js 20+
- Python 3.12+
- PostgreSQL (or use Docker for database only)

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt  # or use the packages from pyproject.toml
python main.py
```

Backend runs on http://localhost:8000

#### Run Both Concurrently
```bash
cd frontend
npm run dev:all
```

## 📁 Project Structure

```
snake-arena-live/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── api/            # API client and mock API
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   └── types/          # TypeScript type definitions
│   ├── Dockerfile          # Frontend container image
│   └── nginx.conf          # Nginx configuration
│
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── routers/        # API route handlers
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── security.py     # Auth utilities
│   │   ├── db.py           # Database connection
│   │   └── main.py         # FastAPI app
│   ├── tests/              # Unit tests
│   ├── tests_integration/  # Integration tests
│   ├── Dockerfile          # Backend container image
│   └── entrypoint.sh       # Container startup script
│
├── docker-compose.yml       # Docker orchestration
├── docker-compose.prod.yml  # Production overrides
└── .env.example            # Environment template
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage
```

### Backend Tests
```bash
cd backend

# Unit tests
pytest tests/

# Integration tests (with SQLite)
pytest tests_integration/

# All tests with coverage
pytest --cov=app --cov-report=html
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
POSTGRES_USER=snakearena
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=snake_arena_db
DATABASE_URL=postgresql://snakearena:your-secure-password@postgres:5432/snake_arena_db

# Backend
SECRET_KEY=your-secret-key-min-32-chars
ENVIRONMENT=development

# Frontend
VITE_API_URL=http://localhost:8000
```

### Production Configuration

For production deployment:

1. **Generate secure secrets**
```bash
# Generate SECRET_KEY
openssl rand -hex 32
```

2. **Update CORS settings** in `backend/app/main.py`
```python
allow_origins=["https://yourdomain.com"]
```

3. **Configure PostgreSQL** with production settings
4. **Set up SSL/TLS** for nginx
5. **Use production compose file**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# View logs
docker-compose logs -f

# Execute commands in container
docker-compose exec backend bash
docker-compose exec postgres psql -U snakearena -d snake_arena_db
```

## 📊 Database Management

### Initialize Database
```bash
docker-compose exec backend python -c "from app.db import init_db; init_db()"
```

### Seed Database
```bash
docker-compose exec backend python -c "from app.db import seed_database; seed_database()"
```

### Database Backup
```bash
docker-compose exec postgres pg_dump -U snakearena snake_arena_db > backup.sql
```

### Database Restore
```bash
cat backup.sql | docker-compose exec -T postgres psql -U snakearena snake_arena_db
```

## 🎯 API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info (authenticated)

### Leaderboard
- `GET /leaderboard/{mode}` - Get leaderboard for game mode
- `POST /leaderboard/submit` - Submit score (authenticated)

### Live/Spectator
- `GET /live/players` - Get all active players
- `POST /live/update` - Update player state (authenticated)
- `GET /live/stream` - Get player's stream data (authenticated)

### Health
- `GET /health` - Health check endpoint
- `GET /` - API information

Full API documentation: http://localhost:8000/docs

## 🎨 Frontend Routes

- `/` - Home page with game
- `/leaderboard` - Global leaderboards
- `/watch` - Live spectator mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run tests and linting
6. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with FastAPI, React, and PostgreSQL
- UI components from shadcn/ui
- Icons from Lucide React
