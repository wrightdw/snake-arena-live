# Unified Deployment Guide

This directory contains files for deploying the Snake Arena application as a single unified container.

## Architecture

The unified deployment combines:
- **Frontend**: React SPA built with Vite, served by Nginx
- **Backend**: FastAPI application running with Uvicorn
- **Database**: PostgreSQL (separate container)

All services run in the same container using Supervisor, with Nginx acting as a reverse proxy.

## Files

- `Dockerfile.unified` - Multi-stage Dockerfile that builds both frontend and backend
- `docker-compose.unified.yml` - Production-ready Docker Compose configuration
- `nginx.unified.conf` - Nginx configuration that serves frontend and proxies `/api` to backend
- `supervisord.conf` - Supervisor configuration to run both Nginx and Uvicorn

## Quick Start

### 1. Build and Run

```bash
# Build and start the unified container
docker-compose -f docker-compose.unified.yml up -d --build

# Check logs
docker-compose -f docker-compose.unified.yml logs -f

# Check status
docker-compose -f docker-compose.unified.yml ps
```

### 2. Access the Application

- **Application URL**: http://localhost
- **API Documentation**: http://localhost/api/docs
- **Health Check**: http://localhost/health

All API requests from the frontend go to `/api/*` and are automatically proxied to the backend.

### 3. Stop the Application

```bash
docker-compose -f docker-compose.unified.yml down

# Stop and remove volumes (database data)
docker-compose -f docker-compose.unified.yml down -v
```

## Environment Variables

Set these in `docker-compose.unified.yml` or via `.env` file:

- `SECRET_KEY` - JWT secret key (change in production!)
- `DATABASE_URL` - PostgreSQL connection string
- `ACCESS_TOKEN_EXPIRE_MINUTES` - JWT token expiration (default: 30)

## Production Deployment

### Security Considerations

1. **Change the SECRET_KEY**: Generate a secure random key
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Use environment variables**: Don't hardcode secrets in docker-compose.yml
   ```bash
   export SECRET_KEY="your-secure-secret-key"
   export POSTGRES_PASSWORD="your-secure-db-password"
   ```

3. **Use HTTPS**: Put a reverse proxy (like Traefik or Caddy) in front for SSL/TLS

### Scaling

To run multiple instances of the app container:

```bash
docker-compose -f docker-compose.unified.yml up -d --scale app=3
```

Add a load balancer (nginx, HAProxy, or Traefik) to distribute traffic.

### Monitoring

View application logs:
```bash
# All logs
docker-compose -f docker-compose.unified.yml logs -f app

# Just backend logs
docker exec snake-arena-app tail -f /var/log/supervisor/backend.log

# Just nginx logs
docker exec snake-arena-app tail -f /var/log/nginx/access.log
```

## Differences from Development Setup

| Aspect | Development | Unified Production |
|--------|-------------|-------------------|
| Containers | 3 separate (frontend, backend, postgres) | 2 (app + postgres) |
| Ports | 5173 (frontend), 8000 (backend) | 80 (nginx serves both) |
| Hot Reload | Yes (volume mounts) | No (built into image) |
| API URL | Separate port | `/api` prefix |
| Process Manager | Docker Compose only | Supervisor + Docker Compose |

## Troubleshooting

### Check if services are running
```bash
docker exec snake-arena-app supervisorctl status
```

### Restart a service
```bash
docker exec snake-arena-app supervisorctl restart backend
docker exec snake-arena-app supervisorctl restart nginx
```

### Check backend is responding
```bash
docker exec snake-arena-app wget -O- http://127.0.0.1:8000/health
```

### Database connection issues
```bash
# Check if postgres is reachable
docker exec snake-arena-app pg_isready -h postgres -U snake_admin

# Connect to database
docker exec -it snake-arena-db psql -U snake_admin -d snake_arena
```

## Build Arguments

You can customize the build with arguments:

```bash
docker build -f Dockerfile.unified \
  --build-arg VITE_API_URL=/api \
  -t snake-arena:latest .
```

## Volume Management

The PostgreSQL data is persisted in a Docker volume:

```bash
# List volumes
docker volume ls

# Backup database
docker exec snake-arena-db pg_dump -U snake_admin snake_arena > backup.sql

# Restore database
cat backup.sql | docker exec -i snake-arena-db psql -U snake_admin -d snake_arena
```
