# Docker Setup for Snake Arena Live

This directory contains Docker configuration for running the complete Snake Arena application stack.

## Services

- **frontend**: React application served by Nginx
- **backend**: FastAPI application
- **postgres**: PostgreSQL database

## Quick Start

### Development Mode
```bash
docker-compose up
```

### Production Mode
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- PostgreSQL: localhost:5432

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
POSTGRES_USER=snakearena
POSTGRES_PASSWORD=changeme123
POSTGRES_DB=snake_arena_db
DATABASE_URL=postgresql://snakearena:changeme123@postgres:5432/snake_arena_db

# Backend
SECRET_KEY=your-secret-key-change-in-production
ENVIRONMENT=development

# Frontend
VITE_API_URL=http://localhost:8000
```

## Commands

### Build and start all services
```bash
docker-compose up --build
```

### Start in detached mode
```bash
docker-compose up -d
```

### Stop all services
```bash
docker-compose down
```

### Stop and remove volumes (WARNING: deletes database)
```bash
docker-compose down -v
```

### View logs
```bash
docker-compose logs -f
```

### View specific service logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild specific service
```bash
docker-compose up --build backend
```

### Execute commands in running container
```bash
# Backend shell
docker-compose exec backend bash

# Run migrations
docker-compose exec backend python -c "from app.db import init_db; init_db()"

# PostgreSQL shell
docker-compose exec postgres psql -U snakearena -d snake_arena_db
```

## Development

### Hot Reload

Both frontend and backend support hot reload:
- Frontend: Vite dev server with HMR
- Backend: Uvicorn with `--reload` flag

Changes to source code will automatically reload the application.

### Database Migrations

The database is automatically initialized on startup. To reset:

```bash
docker-compose down -v
docker-compose up
```

## Production Considerations

1. **Change default passwords** in `.env`
2. **Use production SECRET_KEY**
3. **Configure CORS** properly in backend
4. **Use HTTPS** with proper certificates
5. **Set up database backups**
6. **Use production-grade PostgreSQL settings**
7. **Configure nginx for SSL/TLS**

## Troubleshooting

### Port conflicts
If ports 3000, 8000, or 5432 are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "3001:80"  # Change frontend to port 3001
```

### Database connection errors
Ensure the `DATABASE_URL` in backend matches PostgreSQL credentials:
```
postgresql://[user]:[password]@postgres:5432/[database]
```

### Frontend not connecting to backend
Check `VITE_API_URL` environment variable and CORS settings in backend.

### Permission errors
On Linux, you may need to fix file permissions:
```bash
sudo chown -R $USER:$USER .
```

## Volumes

- `postgres_data`: PostgreSQL data (persisted)
- Backend and frontend use bind mounts for development

## Networks

All services are on the `snake-arena-network` bridge network, allowing them to communicate using service names.
