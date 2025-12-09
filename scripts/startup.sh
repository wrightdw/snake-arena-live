#!/bin/bash
# Startup script for Snake Arena Live

set -e

echo "=================================="
echo "Snake Arena Live - Startup Script"
echo "=================================="

# Set ports to public
bash scripts/set-ports-public.sh

echo ""
echo "Starting Docker Compose services..."
docker-compose up -d

echo ""
echo "Waiting for services to be healthy..."
sleep 5

echo ""
echo "=================================="
echo "Application started successfully!"
echo "=================================="
echo ""
echo "Frontend: https://${CODESPACE_NAME}-3000.app.github.dev"
echo "Backend:  https://${CODESPACE_NAME}-8000.app.github.dev"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop services: docker-compose down"
echo "=================================="
