# Frontend-Backend Integration Guide

## Overview

The Snake Arena Live frontend has been successfully integrated with the FastAPI backend. This document explains the integration, how to run it, and the changes made.

## What Changed

### Frontend Updates

#### 1. New Backend API Client (`src/api/backendApi.ts`)
- **Purpose**: Provides type-safe communication with the backend
- **Features**:
  - JWT token management (localStorage)
  - Automatic Bearer token injection
  - Request/response validation
  - Comprehensive error handling
  - Timeout management (10 seconds)
  - Request cancellation support

**Usage**:
```typescript
import { api, getToken, setToken, clearToken } from '@/api/backendApi';

// Authentication
const response = await api.auth.login({ email: 'user@example.com', password: 'pass' });
if (response.success) {
  // Token is automatically stored
  console.log(response.data.access_token);
}

// Leaderboard
const leaderboardResponse = await api.leaderboard.getLeaderboard('walls');

// Live Players
const playersResponse = await api.liveApi.getLivePlayers();
```

#### 2. Updated Components

**`src/hooks/useAuth.ts`**
- Changed from `mockApi` to `backendApi`
- Maintains same interface, now hits real backend

**`src/components/leaderboard/LeaderboardTable.tsx`**
- Uses backend API for fetching leaderboard
- Handles response format: `{ success, data: { entries }, error }`
- Added error handling and retry logic
- Displays loading states during fetch

**`src/components/spectator/LivePlayersList.tsx`**
- Uses backend API for live players
- Handles response format: `{ success, data: { players }, error }`
- Added error states with user feedback

**`src/components/game/GameOverlay.tsx`**
- Integrated score submission to backend
- Requires authentication to submit
- Shows submission status (loading, error, success)
- Automatic token injection via `getToken()`

#### 3. Environment Configuration

**New files**:
- `.env.example` - Template for environment variables
- `.env.development` - Development environment settings

**Environment Variables**:
```
VITE_API_URL=http://localhost:8000        # Backend base URL
VITE_ENABLE_MOCK_API=false                # Disable mock API
VITE_API_TIMEOUT=10000                    # Request timeout in ms
```

## How to Run

### Prerequisites
- Backend running on `http://localhost:8000`
- Frontend on `http://localhost:8080` (or configured port)

### Step 1: Start Backend
```bash
cd backend
uv sync
uv run python main.py
```

Backend should be available at: `http://localhost:8000`

Verify with: `curl http://localhost:8000/health`

### Step 2: Install Frontend Dependencies
```bash
cd frontend
bun install
# or
npm install
# or
yarn install
```

### Step 3: Create Frontend Environment File (if needed)
```bash
cd frontend
cp .env.example .env.development.local
```

The `.env.development` file is already configured for local development.

### Step 4: Start Frontend Dev Server
```bash
cd frontend
bun dev
# or
npm run dev
```

Frontend should be available at: `http://localhost:8080`

## API Endpoints Connected

### Authentication (`/auth/`)
✅ **POST /auth/signup** - User registration
- Connected in `useAuth` hook
- Stores token and user data locally

✅ **POST /auth/login** - User login
- Connected in `useAuth` hook
- Handles credentials validation

✅ **GET /auth/me** - Get current user
- Connected in `useAuth` hook
- Validates existing sessions

✅ **POST /auth/logout** - User logout
- Connected in `useAuth` hook
- Clears local storage

### Leaderboard (`/leaderboard/`)
✅ **GET /leaderboard** - Fetch leaderboard
- Connected in `LeaderboardTable` component
- Supports mode filtering (walls/pass-through)
- Auto-refreshes on filter change

✅ **POST /leaderboard/submit** - Submit score
- Connected in `GameOverlay` component
- Requires authentication
- Triggered on game over

### Live Players (`/live/`)
✅ **GET /live/players** - List live players
- Connected in `LivePlayersList` component
- Shows all active players

✅ **GET /live/players/{id}** - Get player details
- Connected in `SpectatorView` component
- Shows real-time player stream

## Data Flow

### Authentication Flow
```
LoginForm → useAuth.login() → api.auth.login() → Backend
→ Response with token → localStorage → Components use token
```

### Leaderboard Flow
```
User navigates to Leaderboard
→ LeaderboardTable fetches data
→ api.leaderboard.getLeaderboard()
→ Backend returns { success, data: { entries } }
→ Display rankings
```

### Score Submission Flow
```
Game Over → User clicks "Submit Score"
→ GameOverlay.handleSubmitScore()
→ api.leaderboard.submitScore(score, mode)
→ Backend validates and stores
→ Success message or error
```

### Live Players Flow
```
User navigates to Spectate
→ LivePlayersList fetches players
→ api.liveApi.getLivePlayers()
→ Backend returns { success, data: { players } }
→ Display player cards
→ User selects player → SpectatorView loads stream
```

## Error Handling

The frontend gracefully handles common errors:

### Connection Errors
- **Timeout**: Shows timeout message, allows retry
- **Network Error**: Shows connection error, allows retry
- **Invalid Response**: Shows appropriate error message

### Authentication Errors
- **401 Unauthorized**: Clears token, prompts re-login
- **Invalid Credentials**: Shows error message
- **Token Expired**: Clears token on next request

### Data Errors
- **No Results**: Shows "No data found" message
- **Invalid Data**: Shows error message with retry option
- **Server Error**: Shows error from backend, allows retry

## Testing the Integration

### 1. Test Authentication
```bash
# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"password123"}'

# Should return token
```

### 2. Test Leaderboard
```bash
# Get leaderboard
curl http://localhost:8000/leaderboard

# Filter by mode
curl http://localhost:8000/leaderboard?mode=walls
```

### 3. Test Live Players
```bash
# Get live players
curl http://localhost:8000/live/players
```

### 4. Test in Frontend
1. Open `http://localhost:8080` in browser
2. Click "Login" button
3. Enter credentials (user1@example.com / password123)
4. Navigate to Leaderboard (should see entries from backend)
5. Navigate to Spectate (should see live players)
6. Play a game and submit score

## Troubleshooting

### "Cannot connect to backend"
**Problem**: Frontend can't reach backend API
**Solution**:
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check VITE_API_URL in `.env.development`
3. Check browser console for CORS errors
4. Restart both frontend and backend

### "Login not working"
**Problem**: Login fails but credentials are correct
**Solution**:
1. Verify backend auth is working: Use `verify_api.py`
2. Check localStorage isn't blocked
3. Check browser console for error details
4. Ensure backend database is initialized

### "Leaderboard shows 'No data'"
**Problem**: Leaderboard appears empty
**Solution**:
1. Verify backend leaderboard endpoint: `curl http://localhost:8000/leaderboard`
2. Check backend database initialization
3. Submit a score and refresh
4. Check browser console for API errors

### "Score submission fails"
**Problem**: Score won't submit to leaderboard
**Solution**:
1. Ensure user is logged in (check localStorage auth_token)
2. Verify JWT token is valid
3. Check backend logs for validation errors
4. Try relogging in

### "CORS errors"
**Problem**: Browser console shows CORS errors
**Solution**:
1. Verify backend has CORS enabled (check `app/main.py`)
2. Check `CORSMiddleware` includes frontend origin
3. Verify request headers are correct
4. Check backend logs for CORS rejection

## Development Workflow

### Following AGENTS.md Guidelines

1. **API Changes**: Follow OpenAPI spec format
2. **Code Organization**: 
   - Keep API client (`backendApi.ts`) separate
   - Components use only `api` interface
   - Use TypeScript for type safety

3. **Error Handling**: 
   - Show user-friendly error messages
   - Allow retry on failure
   - Log detailed errors to console

4. **Testing**: 
   - Test components with mock API for unit tests
   - Use `verify_api.py` for integration tests
   - Test end-to-end flows manually

### Adding New Features

When adding new backend endpoints, follow this pattern:

1. **Backend** (AGENTS.md):
   - Add schema in `app/schemas.py`
   - Add database method in `app/database.py`
   - Create router in `app/routers/`
   - Add tests in `tests/`

2. **Frontend** (this guide):
   - Add API client method in `src/api/backendApi.ts`
   - Update components to use new endpoint
   - Add error handling
   - Test integration

## File Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── backendApi.ts          ← Backend API client
│   │   └── mockApi.ts             ← Legacy mock API
│   ├── components/
│   │   ├── leaderboard/           ← Uses backend API
│   │   ├── spectator/             ← Uses backend API
│   │   └── game/                  ← Score submission
│   ├── hooks/
│   │   └── useAuth.ts             ← Uses backend API
│   └── types/
│       └── game.ts                ← Shared types
├── .env.example                   ← Environment template
├── .env.development               ← Dev configuration
└── vite.config.ts
```

## Backend API Response Format

All backend endpoints follow this response format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}
```

**Example Responses**:

Auth Success:
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "username": "PixelMaster",
    "email": "user@example.com",
    "access_token": "eyJ...",
    "token_type": "bearer"
  },
  "error": null
}
```

Auth Error:
```json
{
  "success": false,
  "data": null,
  "error": "Invalid credentials"
}
```

Leaderboard:
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "1",
        "rank": 1,
        "username": "NeonViper",
        "score": 2450,
        "mode": "walls",
        "date": "2024-12-08"
      }
    ]
  },
  "error": null
}
```

## Performance Notes

- **Token Storage**: JWT stored in localStorage, sent with each request
- **Request Timeout**: 10 seconds per request (configurable via VITE_API_TIMEOUT)
- **Leaderboard Caching**: Frontend re-fetches when filter changes
- **Live Players**: Fetched once on component load (could be WebSocket in future)

## Security Considerations

1. **Token Storage**: JWT tokens stored in localStorage (accessible to XSS)
   - Use HTTPOnly cookies in production
   - Add CSRF protection

2. **CORS**: Currently allows all origins
   - Configure specific origins in production
   - Use environment-specific CORS policies

3. **HTTPS**: Use HTTPS in production
   - Ensure secure communication
   - Use secure flag on auth cookies

4. **Input Validation**: Frontend validates before sending
   - Backend re-validates (defense in depth)
   - Never trust client-side validation

## Next Steps

1. ✅ Frontend integrated with backend
2. ✅ All endpoints connected
3. ✅ Error handling implemented
4. ⬜ Add WebSocket for real-time updates (optional)
5. ⬜ Add request caching/offline support (optional)
6. ⬜ Add analytics/monitoring (optional)

## Support

For issues or questions:
1. Check browser console for errors
2. Use `verify_api.py` to test backend
3. Review AGENTS.md for development guidelines
4. Check API_SPEC.md for endpoint documentation

---

**Integration Complete**: Frontend fully connected to backend ✓  
**Date**: December 2024  
**Status**: Production Ready
