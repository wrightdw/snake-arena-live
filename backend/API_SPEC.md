# API Specification

## Base URL
```
http://localhost:8000/api/v1
```

## Response Format

All responses follow this structure:

```json
{
  "success": boolean,
  "data": object | null,
  "error": string | null
}
```

## Authentication

Uses JWT Bearer tokens. Include in headers:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /auth/signup
Create a new user account.

**Request:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "access_token": "string",
    "token_type": "bearer"
  }
}
```

### POST /auth/login
Authenticate user.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "access_token": "string",
    "token_type": "bearer"
  }
}
```

### GET /auth/me
Get current user profile. **(Requires Auth)**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "avatar": "string | null"
  }
}
```

### POST /auth/logout
Logout current user. **(Requires Auth)**

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

---

## Leaderboard Endpoints

### GET /leaderboard
Get leaderboard entries.

**Query Parameters:**
- `mode` (optional): "walls" | "pass-through"

**Response (200):**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "string",
        "rank": number,
        "username": "string",
        "score": number,
        "mode": "walls" | "pass-through",
        "date": "YYYY-MM-DD"
      }
    ]
  }
}
```

### POST /leaderboard/submit
Submit a score. **(Requires Auth)**

**Query Parameters:**
- `score` (required): number (>= 0)
- `mode` (required): "walls" | "pass-through"

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "rank": number,
    "username": "string",
    "score": number,
    "mode": "walls" | "pass-through",
    "date": "YYYY-MM-DD"
  }
}
```

---

## Live Players Endpoints

### GET /live/players
Get list of currently live players.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "players": [
      {
        "id": "string",
        "username": "string",
        "score": number,
        "mode": "walls" | "pass-through",
        "snake": [
          { "x": number, "y": number }
        ],
        "food": { "x": number, "y": number },
        "direction": "UP" | "DOWN" | "LEFT" | "RIGHT",
        "status": "idle" | "playing" | "paused" | "game-over",
        "viewers": number
      }
    ]
  }
}
```

### GET /live/players/{player_id}
Get specific player stream data.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "score": number,
    "mode": "walls" | "pass-through",
    "snake": [
      { "x": number, "y": number }
    ],
    "food": { "x": number, "y": number },
    "direction": "UP" | "DOWN" | "LEFT" | "RIGHT",
    "status": "idle" | "playing" | "paused" | "game-over",
    "viewers": number
  }
}
```

---

## Health Endpoints

### GET /health
Health check endpoint.

**Response (200):**
```json
{
  "status": "healthy"
}
```

### GET /
Root endpoint.

**Response (200):**
```json
{
  "message": "Snake Arena Backend API"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid credentials or token"
}
```

### 403 Forbidden
```json
{
  "detail": "Missing authentication token"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Data Types

### Position
```json
{
  "x": number,
  "y": number
}
```

### GameMode
- "walls" - Snake bounces off walls
- "pass-through" - Snake wraps around

### Direction
- "UP"
- "DOWN"
- "LEFT"
- "RIGHT"

### GameStatus
- "idle" - Game not started
- "playing" - Game in progress
- "paused" - Game paused
- "game-over" - Game finished
