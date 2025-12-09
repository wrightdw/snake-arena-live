# Quick Start: Using verify_api.py

## Installation & Setup

### 1. Ensure Dependencies are Installed
```bash
cd backend
uv sync
```

This installs `requests` which is required by the verification script.

### 2. Verify the Script Exists
```bash
ls -l verify_api.py
```

Should show the `verify_api.py` file in the backend directory.

## Running the Verification Script

### Step 1: Start the API Server
In a terminal window:
```bash
cd /workspaces/snake-arena-live/backend
uv run python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Step 2: Run Verification in Another Terminal
```bash
cd /workspaces/snake-arena-live/backend
python verify_api.py
```

### Expected Output
You'll see a comprehensive test report showing:
- ✓ Health checks passing
- ✓ Authentication tests (signup, login, etc.)
- ✓ Leaderboard functionality
- ✓ Live players endpoints
- ✓ Security validations
- Summary with pass/fail counts

## Common Usage Scenarios

### Development: Quick Validation
```bash
python verify_api.py
```
Fast check that all endpoints work.

### Debugging: Verbose Output
```bash
python verify_api.py --verbose
```
Shows detailed request/response information for each test.

### Remote Server: Custom URL
```bash
python verify_api.py --url http://api.example.com:8000
```
Test an API running on a different host/port.

### CI/CD: Machine-Readable Output
```bash
python verify_api.py --no-color
# Exit code: 0 = success, 1 = failure
```

## What Gets Tested

The script validates **22+ tests** covering:

**Health & Status** (2 tests)
- `/health` - Server health check
- `/` - Root endpoint

**Authentication** (6 tests)
- POST `/auth/signup` - User registration
- POST `/auth/login` - User login
- GET `/auth/me` - Get profile (protected)
- POST `/auth/logout` - User logout
- Invalid credentials handling
- Duplicate email handling

**Leaderboard** (5 tests)
- GET `/leaderboard` - Get all scores
- GET `/leaderboard?mode=walls` - Filter by game mode
- POST `/leaderboard/submit` - Submit new score
- Validation: negative scores rejected
- Validation: invalid modes rejected

**Live Players** (3 tests)
- GET `/live/players` - List active players
- GET `/live/players/{id}` - Get player stream
- 404 handling for non-existent players

**Security** (3 tests)
- Missing required fields
- Invalid JSON bodies
- Protected endpoints without authentication

## Interpreting Results

### ✓ PASS
Green checkmark = endpoint working correctly
- Response status code matches expectation
- Response format is valid JSON
- Data structure is correct

### ✗ FAIL
Red X = endpoint issue detected
- Unexpected status code
- Invalid response format
- Data validation failure
- Connection error

### ⊘ SKIP
Yellow dash = test skipped (dependency failed)
- Usually due to auth token not obtained
- Check earlier tests for root cause

## Troubleshooting

### "Cannot connect to http://localhost:8000"
**Make sure:**
- Server is running: `uv run python main.py`
- Correct port 8000 (or use `--url` flag)
- No firewall blocking localhost:8000

### "All tests failed with 502"
**Check:**
- Server isn't hung or crashed
- Restart server: stop and run `uv run python main.py` again
- Check for Python errors in server output

### "Authentication tests failing"
**Check:**
- Database has test users (should auto-create)
- Password hashing working (`bcrypt` installed)
- Check server logs for auth errors

### "Leaderboard tests failing"
**Check:**
- Database is properly initialized
- Score validation is correct
- Mode enum values match specification

## Integration with Your Workflow

### Before Committing
```bash
python verify_api.py
```
Ensure your changes didn't break the API.

### After Deployment
```bash
python verify_api.py --url http://deployed-api.com:8000
```
Verify the deployed API is working.

### During Development
```bash
python verify_api.py --verbose
```
Debug specific endpoint issues.

## Performance Expectations

- **Total runtime**: 2-5 seconds
- **Per-request timeout**: 10 seconds
- **Server response time**: Should be < 1s per request

If tests take longer, server may be under load or having issues.

## Understanding the Output Structure

```
🚀 Starting API Verification          # Script starts
Target: http://localhost:8000

ℹ ✓ Server is reachable               # Connectivity check

🏥 Testing Health Checks              # Test category
----------------------------------------------------------------------
  [PASS] Health Check ...             # Individual test result
  [PASS] Root Endpoint ...

📊 Test Summary                        # Final summary
======================================================================
Total Tests:  22
  ✓ Passed: 22
  ✗ Failed: 0
  Pass Rate: 100.0%
```

## Next Steps

✅ **API Working?** 
- Proceed with feature development
- Run verification before each commit

❌ **Tests Failing?**
1. Check server logs: `tail -n 50 server.log`
2. Run with verbose: `python verify_api.py --verbose`
3. Review API_SPEC.md for endpoint requirements
4. Check database state: look at test_database.py tests

## Documentation

For more details, see:
- **VERIFY_API.md** - Full verification script documentation
- **API_SPEC.md** - Complete API specification
- **QUICKSTART.md** - Quick reference guide
- **README.md** - Full project documentation

---

**Tip**: Create an alias for quick testing:
```bash
alias verify-api="python /workspaces/snake-arena-live/backend/verify_api.py"
```

Then simply run: `verify-api`
