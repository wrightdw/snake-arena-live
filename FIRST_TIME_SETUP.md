
# ⚠️ IMPORTANT: First-Time Setup in GitHub Codespaces

## Step 1: Set Ports to Public (REQUIRED)

Before using the application, you **must** manually set ports to public:

1. Open the **PORTS** tab in VS Code (bottom panel)
2. Right-click port **3000** → **Port Visibility** → **Public**
3. Right-click port **8000** → **Port Visibility** → **Public**

## Step 2: Start the Application

```bash
make start
```

Or manually:
```bash
docker-compose up -d
```

## Access the Application

- Frontend: `https://<codespace-name>-3000.app.github.dev`
- Backend: `https://<codespace-name>-8000.app.github.dev`

---

**Why are public ports needed?**

The frontend (browser) needs to make API calls to the backend. Private ports require GitHub authentication which breaks CORS preflight requests.

---

See [CODESPACES.md](./CODESPACES.md) for full documentation.
