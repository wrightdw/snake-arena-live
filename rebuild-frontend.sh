#!/bin/bash
# Rebuild just the frontend service
docker-compose up -d --build frontend
echo "Frontend rebuilt and restarted!"
echo "Check logs with: docker-compose logs -f frontend"
