#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -U ${POSTGRES_USER:-snakearena} -d ${POSTGRES_DB:-snake_arena_db}; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - initializing database"

# Initialize database (create tables)
python -c "from app.db import init_db; init_db()"

echo "Database initialized - starting application"

# Execute the main command
exec "$@"
