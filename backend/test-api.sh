#!/bin/bash
# Example API calls for testing Snake Arena Backend

BASE_URL="http://localhost:8000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Snake Arena Backend - API Test Examples${NC}\n"

# ==================================================
# HEALTH CHECKS
# ==================================================
echo -e "${GREEN}=== HEALTH CHECKS ===${NC}\n"

echo "1. Health Check:"
curl -s "$BASE_URL/health" | jq .
echo ""

echo "2. Root Endpoint:"
curl -s "$BASE_URL/" | jq .
echo ""

# ==================================================
# AUTHENTICATION
# ==================================================
echo -e "${GREEN}=== AUTHENTICATION ===${NC}\n"

echo "1. Login (existing user):"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "password123"
  }')
echo $LOGIN_RESPONSE | jq .
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.access_token')
echo "Token: $TOKEN"
echo ""

echo "2. Sign Up (new user):"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "TestPlayer",
    "email": "test@example.com",
    "password": "securepassword123"
  }')
echo $SIGNUP_RESPONSE | jq .
NEW_TOKEN=$(echo $SIGNUP_RESPONSE | jq -r '.data.access_token')
echo ""

echo "3. Get Current User (requires auth):"
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "4. Logout (requires auth):"
curl -s -X POST "$BASE_URL/auth/logout" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# ==================================================
# LEADERBOARD
# ==================================================
echo -e "${GREEN}=== LEADERBOARD ===${NC}\n"

echo "1. Get All Leaderboard Entries:"
curl -s "$BASE_URL/leaderboard" | jq .
echo ""

echo "2. Get Leaderboard - Walls Mode:"
curl -s "$BASE_URL/leaderboard?mode=walls" | jq .
echo ""

echo "3. Get Leaderboard - Pass-Through Mode:"
curl -s "$BASE_URL/leaderboard?mode=pass-through" | jq .
echo ""

echo "4. Submit Score (requires auth):"
SCORE_RESPONSE=$(curl -s -X POST "$BASE_URL/leaderboard/submit?score=1000&mode=walls" \
  -H "Authorization: Bearer $TOKEN")
echo $SCORE_RESPONSE | jq .
echo ""

echo "5. Submit Score (pass-through mode):"
curl -s -X POST "$BASE_URL/leaderboard/submit?score=750&mode=pass-through" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# ==================================================
# LIVE PLAYERS
# ==================================================
echo -e "${GREEN}=== LIVE PLAYERS ===${NC}\n"

echo "1. Get All Live Players:"
PLAYERS=$(curl -s "$BASE_URL/live/players")
echo $PLAYERS | jq .
FIRST_PLAYER_ID=$(echo $PLAYERS | jq -r '.data.players[0].id')
echo "First player ID: $FIRST_PLAYER_ID"
echo ""

echo "2. Get Specific Player Stream:"
curl -s "$BASE_URL/live/players/$FIRST_PLAYER_ID" | jq .
echo ""

echo "3. Get Non-Existent Player (should 404):"
curl -s "$BASE_URL/live/players/nonexistent" | jq .
echo ""

# ==================================================
# ERROR CASES
# ==================================================
echo -e "${GREEN}=== ERROR CASES ===${NC}\n"

echo "1. Login with invalid password:"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "wrongpassword"
  }' | jq .
echo ""

echo "2. Sign up with existing email:"
curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "AnotherName",
    "email": "user1@example.com",
    "password": "password123"
  }' | jq .
echo ""

echo "3. Submit score with invalid mode:"
curl -s -X POST "$BASE_URL/leaderboard/submit?score=500&mode=invalid" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "4. Submit score without auth:"
curl -s -X POST "$BASE_URL/leaderboard/submit?score=500&mode=walls" | jq .
echo ""

echo "5. Access protected endpoint without token:"
curl -s "$BASE_URL/auth/me" | jq .
echo ""

echo -e "${YELLOW}=== END OF TESTS ===${NC}"
echo ""
echo "Note: Make sure the server is running with: uv run python main.py"
