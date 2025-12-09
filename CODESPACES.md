# GitHub Codespaces Setup

## ⚠️ IMPORTANT: Port Configuration (Required)

**Before accessing the application**, you must set ports to public:

### Manual Port Configuration (REQUIRED)

GitHub Codespaces requires manual port visibility configuration for CORS to work properly.

1. Open the **PORTS** tab in VS Code (bottom panel, next to Terminal)
2. Find port **3000** (Frontend):
   - Right-click → **Port Visibility** → **Public**
3. Find port **8000** (Backend API):
   - Right-click → **Port Visibility** → **Public**

**Why this is needed:** The frontend (port 3000) needs to make API requests to the backend (port 8000). When ports are private, CORS preflight requests fail with 401 errors because they cannot include GitHub authentication.

## Port Configuration

This project uses the following ports:

- **Port 3000**: Frontend (React + Vite with Nginx)
- **Port 8000**: Backend API (FastAPI)
- **Port 5432**: PostgreSQL Database

### Port Visibility

Both ports 3000 and 8000 are configured to be **public** by default through:
- `.devcontainer/devcontainer.json` - Devcontainer configuration
- `.vscode/settings.json` - VS Code workspace settings

These settings should automatically make the ports public when the Codespace starts.

### Manual Port Configuration (if needed)

If ports are not automatically set to public:

1. Open the **PORTS** tab in VS Code (bottom panel)
2. For port **3000**:
   - Right-click → **Port Visibility** → **Public**
3. For port **8000**:
   - Right-click → **Port Visibility** → **Public**

### Why Public Ports Are Needed

The frontend (port 3000) needs to make API requests to the backend (port 8000). When the frontend runs in the browser, it makes requests from the client side. If port 8000 is private, CORS preflight requests will fail with a 401 error because they cannot include GitHub authentication.

## Starting the Application

### Recommended: Use the startup script (sets ports to public automatically)
```bash
make start
# or
bash scripts/startup.sh
```

### Or manually:
```bash
# Set ports to public first
make ports-public

# Start all services
docker-compose up

# Or start in detached mode
docker-compose up -d

# Rebuild and start
docker-compose up --build
```

## Accessing the Application

Once running, the application will be available at:
- Frontend: `https://[codespace-name]-3000.app.github.dev`
- Backend API: `https://[codespace-name]-8000.app.github.dev`

The frontend automatically detects the correct backend URL based on the Codespace domain.

## Troubleshooting

### CORS Errors / 401 Preflight Errors

If you see errors like:
```
Preflight response is not successful. Status code: 401
```

This means port 8000 is not public. Follow the manual port configuration steps above.

### Port Not Auto-Forwarding

If ports don't appear automatically:
1. Check that Docker Compose services are running: `docker-compose ps`
2. Manually forward the ports in the PORTS tab
3. Ensure they are set to **Public** visibility
