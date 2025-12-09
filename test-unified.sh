#!/bin/bash

echo "=== Unified Deployment Test ==="
echo ""
echo "Starting unified deployment..."
docker-compose -f docker-compose.unified.yml up -d

echo ""
echo "Waiting for services to start..."
sleep 10

echo ""
echo "=== Container Status ==="
docker-compose -f docker-compose.unified.yml ps

echo ""
echo "=== Supervisor Status ==="
docker exec snake-arena-app supervisorctl status

echo ""
echo "=== Health Check ==="
curl -f http://localhost/health && echo "✓ Health check passed" || echo "✗ Health check failed"

echo ""
echo "=== API Docs ==="
curl -I http://localhost/api/docs

echo ""
echo "=== Frontend ==="
curl -I http://localhost/

echo ""
echo "=== View Logs ==="
echo "Backend logs: docker exec snake-arena-app tail -f /var/log/supervisor/backend.log"
echo "Nginx logs: docker exec snake-arena-app tail -f /var/log/nginx/access.log"
echo "All logs: docker-compose -f docker-compose.unified.yml logs -f"
