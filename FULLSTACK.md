# Full Stack Quick Start

## Running Both Frontend and Backend

This guide explains how to run the complete Snake Arena Live application with both frontend and backend working together.

## Prerequisites

- **Node.js/Bun** (for frontend)
- **Python 3.11+** (for backend)
- **uv** package manager (for backend)
- **Two terminals** (one for backend, one for frontend)

## Quick Start (3 Minutes)

### Terminal 1: Backend
```bash
cd backend
uv sync
uv run python main.py
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Terminal 2: Frontend
```bash
cd frontend
bun install    # or: npm install
bun dev        # or: npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:8080/
```

## Accessing the Application

Open your browser and go to: **http://localhost:8080**

You should see the Snake Arena Live game with:
- ✅ Login/Signup working
- ✅ Leaderboard populated from backend
- ✅ Live players showing
- ✅ Score submission working

## Testing the Integration

### 1. Login with Test User
Click "Login" button in top-right
```
Email: user1@example.com
Password: password123
```

### 2. View Leaderboard
- Click "LEADERBOARD" tab
- Should see scores from backend database
- Try filtering by mode (All, Walls, Pass-Through)

### 3. Play a Game
- Click "PLAY" tab
- Select game mode
- Play the snake game
- When game ends, click "Submit Score"
- Check leaderboard to see your score

### 4. View Live Players
- Click "SPECTATE" tab
- Should see live players from backend
- Click on a player to spectate

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Browser (http://localhost:8080)               │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │         Frontend (React + TypeScript)            │  │
│  │  - Login/Signup (useAuth hook)                   │  │
│  │  - Leaderboard (LeaderboardTable component)      │  │
│  │  - Live Players (LivePlayersList component)      │  │
│  │  - Snake Game (SnakeGame component)              │  │
│  └─────────────────────────────────────────────────┘  │
│                       ↓ (HTTP/JSON)                     │
└─────────────────────────────────────────────────────────┘
                            ↕
            ┌──────────────────────────────┐
            │  Backend API Server (8000)   │
            │                              │
            │  ┌──────────────────────┐   │
            │  │  FastAPI Application │   │
            │  ├──────────────────────┤   │
            │  │ /auth/signup         │   │
            │  │ /auth/login          │   │
            │  │ /auth/me             │   │
            │  │ /auth/logout         │   │
            │  ├──────────────────────┤   │
            │  │ /leaderboard         │   │
            │  │ /leaderboard/submit  │   │
            │  ├──────────────────────┤   │
            │  │ /live/players        │   │
            │  │ /live/players/{id}   │   │
            │  └──────────────────────┘   │
            │                              │
            │  ┌──────────────────────┐   │
            │  │  Mock Database       │   │
            │  │  - Users             │   │
            │  │  - Leaderboard       │   │
            │  │  - Live Players      │   │
            │  └──────────────────────┘   │
            │                              │
            └──────────────────────────────┘
```

## Environment Configuration

### Backend (.env)
The backend uses environment variables from `.env` file:
```
SECRET_KEY=your-secret-key
DATABASE_URL=mock://  # Using mock database for now
API_TITLE=Snake Arena
API_CORS_ORIGINS=*
```

### Frontend (.env.development)
Already configured for local development:
```
VITE_API_URL=http://localhost:8000
VITE_ENABLE_MOCK_API=false
VITE_API_TIMEOUT=10000
```

## Verifying the Integration

### Backend Verification
```bash
cd backend
python verify_api.py
```

Should show:
```
🚀 Starting API Verification
Target: http://localhost:8000

ℹ ✓ Server is reachable

[Test results...]

📊 Test Summary
Total Tests:  22+
  ✓ Passed: 22+
  ✗ Failed: 0
  Pass Rate: 100.0%
```

### Frontend Verification
1. Open browser console (F12)
2. No red errors should appear
3. API calls should succeed (check Network tab)
4. localStorage should contain `auth_token` after login

## Common Issues & Solutions

### "Cannot connect to http://localhost:8000"
**Problem**: Frontend can't reach backend
```bash
# Check if backend is running
curl http://localhost:8000/health

# Should return: {"success":true}
```

### "Login fails with 'Cannot fetch'"
**Problem**: CORS or connection issue
```bash
# Ensure backend has CORS enabled
# Check app/main.py for CORSMiddleware
# Restart backend with: uv run python main.py
```

### "Leaderboard shows empty"
**Problem**: No data from backend
```bash
# Check backend API returns data
curl http://localhost:8000/leaderboard

# Should return JSON with entries
```

### "Score won't submit"
**Problem**: Authentication or validation issue
1. Ensure you're logged in (check localStorage)
2. Try submitting with score > 0
3. Check browser console for errors

## Performance Tips

### Frontend
- **Optimize imports**: Tree-shake unused components
- **Lazy load routes**: Load pages on demand
- **Cache data**: Consider caching leaderboard
- **Minimize bundles**: Use production build for testing

```bash
cd frontend
bun run build
```

### Backend
- **Use async**: All endpoints use async/await
- **Connection pooling**: Mock DB doesn't need this yet
- **Response caching**: Could cache leaderboard
- **Database indexing**: Important for PostgreSQL migration

## Production Deployment

### Backend Deployment
1. Set real `SECRET_KEY`
2. Configure `DATABASE_URL` for PostgreSQL
3. Update `API_CORS_ORIGINS` for frontend domain
4. Deploy to cloud service (Heroku, Railway, etc.)

### Frontend Deployment
1. Update `VITE_API_URL` to production backend
2. Build: `bun run build`
3. Deploy static files (Netlify, Vercel, etc.)
4. Configure environment variables in deployment

## Next Steps

✅ **Frontend and backend running?**
- Play the game
- Submit scores
- View leaderboard
- Test all features

⬜ **Want to add features?**
- Follow AGENTS.md guidelines for backend
- Update backendApi.ts for frontend
- Test with verify_api.py

⬜ **Want to deploy?**
- See Production Deployment section above
- Configure environment variables
- Update API URLs

## Documentation

- **Integration Details**: See `INTEGRATION.md`
- **Backend Setup**: See `backend/README.md`
- **Frontend Setup**: See `frontend/README.md`
- **API Specification**: See `backend/API_SPEC.md`
- **Development Guidelines**: See `backend/AGENTS.md`

## Support

**Issue with backend?**
```bash
cd backend
python verify_api.py --verbose
```

**Issue with frontend?**
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Check Application → Storage for localStorage

**Issue with integration?**
1. Verify both servers are running
2. Check browser console for connection errors
3. Verify API response in Network tab
4. Use `verify_api.py` to test backend directly

## Success Indicators

You'll know it's working when:
- ✅ Frontend loads without errors
- ✅ Login/Signup works
- ✅ Leaderboard shows entries from backend
- ✅ You can submit scores
- ✅ Scores appear in leaderboard
- ✅ Live players show up
- ✅ No CORS errors in console

## Running Commands Reference

```bash
# Backend
cd backend && uv sync              # Install dependencies
cd backend && uv run python main.py # Start server

# Frontend
cd frontend && bun install         # Install dependencies
cd frontend && bun dev             # Start dev server
cd frontend && bun run build       # Build for production

# Testing
cd backend && python verify_api.py # Verify API works
```

---

**Status**: ✅ Full Stack Ready  
**Frontend**: http://localhost:8080  
**Backend**: http://localhost:8000  
**Last Updated**: December 2024
