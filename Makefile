.PHONY: help build up down logs clean test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

start: ## Start application with ports set to public (Codespaces)
	@bash scripts/startup.sh

ports-public: ## Set ports 3000 and 8000 to public (Codespaces)
	@bash scripts/set-ports-public.sh

build: ## Build all Docker images
	docker-compose build

up: ## Start all services
	docker-compose up

up-d: ## Start all services in detached mode
	docker-compose up -d

down: ## Stop all services
	docker-compose down

down-v: ## Stop all services and remove volumes (WARNING: deletes data)
	docker-compose down -v

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

logs-db: ## View database logs
	docker-compose logs -f postgres

shell-backend: ## Open shell in backend container
	docker-compose exec backend bash

shell-db: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U snakearena -d snake_arena_db

test-backend: ## Run backend tests
	docker-compose exec backend pytest tests/

test-integration: ## Run integration tests
	docker-compose exec backend pytest tests_integration/

test-frontend: ## Run frontend tests
	cd frontend && npm test

clean: ## Clean up containers, images, and volumes
	docker-compose down -v
	docker system prune -f

restart: ## Restart all services
	docker-compose restart

rebuild: ## Rebuild and restart all services
	docker-compose up --build -d

rebuild-frontend: ## Rebuild and restart only frontend service
	docker-compose up -d --build frontend

rebuild-backend: ## Rebuild and restart only backend service
	docker-compose up -d --build backend

status: ## Show status of all services
	docker-compose ps

init-db: ## Initialize database
	docker-compose exec backend python -c "from app.db import init_db; init_db()"

seed-db: ## Seed database with sample data
	docker-compose exec backend python -c "from app.db import seed_database; seed_database()"

backup-db: ## Backup database to backup.sql
	docker-compose exec postgres pg_dump -U snakearena snake_arena_db > backup.sql
	@echo "Database backed up to backup.sql"

restore-db: ## Restore database from backup.sql
	cat backup.sql | docker-compose exec -T postgres psql -U snakearena snake_arena_db
	@echo "Database restored from backup.sql"

dev: ## Start development environment (local, not Docker)
	cd frontend && npm run dev:all

install: ## Install dependencies (local development)
	cd frontend && npm install
	cd backend && pip install -r requirements.txt

prod: ## Start production environment
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

prod-build: ## Build and start production environment
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# Unified deployment (single container for frontend + backend)
unified-build: ## Build unified container (frontend + backend in one)
	docker-compose -f docker-compose.unified.yml build

unified-up: ## Start unified deployment
	docker-compose -f docker-compose.unified.yml up -d

unified-down: ## Stop unified deployment
	docker-compose -f docker-compose.unified.yml down

unified-logs: ## View logs from unified deployment
	docker-compose -f docker-compose.unified.yml logs -f

unified-rebuild: ## Rebuild and restart unified deployment
	docker-compose -f docker-compose.unified.yml up --build -d

unified-status: ## Check status of unified deployment
	docker-compose -f docker-compose.unified.yml ps
	@echo "\nSupervisor status:"
	@docker exec snake-arena-app supervisorctl status || echo "Container not running"

