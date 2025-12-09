# API Verification Script

## Overview

`verify_api.py` is a comprehensive testing script that validates all endpoints of the running Snake Arena Backend API server. It performs automated tests on all endpoints, checks response formats, validates data structures, and ensures the API is functioning correctly.

## Features

✅ **Comprehensive Endpoint Coverage**
- Health check endpoints
- Authentication endpoints (signup, login, me, logout)
- Leaderboard endpoints (get, filter, submit)
- Live players endpoints (list, get specific)
- Security and validation tests

✅ **Detailed Validation**
- Response status code verification
- Response format validation
- Data structure validation
- Response time measurement

✅ **User-Friendly Output**
- Color-coded results (pass/fail/skip)
- Detailed test summary
- Clear error messages
- Verbose debugging mode

✅ **Flexible Configuration**
- Custom API base URL
- Verbose output option
- Color output toggle
- Command-line arguments

## Installation

The script requires `requests` library:

```bash
# Using uv (recommended)
uv pip install requests

# Or using pip directly
pip install requests
```

If you're using the project's `uv` package manager:
```bash
uv sync
```

## Usage

### Basic Usage
```bash
python verify_api.py
```

Tests the API at the default URL: `http://localhost:8000`

### With Custom URL
```bash
python verify_api.py --url http://localhost:8000
```

### Verbose Mode (for debugging)
```bash
python verify_api.py --verbose
```

Shows detailed request/response information for each test.

### Without Color Output
```bash
python verify_api.py --no-color
```

Useful for CI/CD pipelines or when color output is not supported.

### Combined Options
```bash
python verify_api.py --url http://api.example.com:8000 --verbose --no-color
```

## Output

The script provides clear, organized output showing:

1. **Connectivity Check**
   - Verifies the server is reachable

2. **Health Checks**
   - `/health` endpoint
   - `/` root endpoint

3. **Authentication Tests**
   - User signup
   - User login
   - Get current user profile
   - User logout
   - Error cases (invalid credentials, duplicate email)

4. **Leaderboard Tests**
   - Get full leaderboard
   - Filter leaderboard by mode
   - Submit score
   - Validate score (negative values)
   - Validate mode

5. **Live Players Tests**
   - List all live players
   - Get specific player details
   - Handle 404 for non-existent players

6. **Security Tests**
   - Missing required fields
   - Invalid JSON bodies
   - Protected endpoint access without auth

7. **Summary Report**
   - Total tests run
   - Pass/fail/skip counts
   - Pass rate percentage
   - List of failures with details

## Example Output

```
🚀 Starting API Verification
Target: http://localhost:8000

ℹ ✓ Server is reachable

🏥 Testing Health Checks
----------------------------------------------------------------------
  [PASS] Health Check (GET /health) - 0.015s
  [PASS] Root Endpoint (GET /) - 0.012s

🔐 Testing Authentication
----------------------------------------------------------------------
  [PASS] Signup (POST /auth/signup) - 0.045s
ℹ Got auth token: eyJhbGciOiJIUzI1NiIsIn...
  [PASS] Login (POST /auth/login) - 0.038s
ℹ Got auth token: eyJhbGciOiJIUzI1NiIsIn...
  [PASS] Get Current User (GET /auth/me) - 0.022s
  [PASS] Logout (POST /auth/logout) - 0.018s
  [PASS] Login Invalid Credentials (POST /auth/login) - 0.025s
  [PASS] Signup Duplicate Email (POST /auth/signup) - 0.032s

🏆 Testing Leaderboard
----------------------------------------------------------------------
  [PASS] Get Leaderboard (GET /leaderboard) - 0.028s
ℹ Leaderboard has 5 entries
  [PASS] Get Leaderboard (walls mode) (GET /leaderboard?mode=walls) - 0.021s
  [PASS] Submit Score (POST /leaderboard/submit) - 0.035s
  [PASS] Submit Invalid Score (negative) (POST /leaderboard/submit) - 0.029s
  [PASS] Submit Invalid Mode (POST /leaderboard/submit) - 0.031s

👥 Testing Live Players
----------------------------------------------------------------------
  [PASS] Get Live Players (GET /live/players) - 0.019s
ℹ Found 3 live players
  [PASS] Get Live Player Details (GET /live/players/player-1) - 0.023s
  [PASS] Get Non-existent Player (GET /live/players/invalid-player-id) - 0.022s

🔒 Testing Security & Validation
----------------------------------------------------------------------
  [PASS] Login Missing Email (POST /auth/login) - 0.024s
  [PASS] Invalid JSON Body (POST /auth/login) - 0.020s
  [PASS] Protected Endpoint No Auth (GET /auth/me) - 0.018s

======================================================================
📊 Test Summary
======================================================================

Total Tests:  22
  ✓ Passed: 22
  ✗ Failed: 0

  Pass Rate: 100.0%

======================================================================
```

## Workflow Examples

### Quick Pre-Deployment Check
```bash
# In one terminal, start the server
uv run python main.py

# In another terminal, verify everything works
python verify_api.py
```

### Development Testing
When making changes to the API, regularly run verification:
```bash
python verify_api.py --verbose
```

### CI/CD Integration
For automated testing in pipelines:
```bash
python verify_api.py --no-color --url $API_URL
# Exit code 0 = success, 1 = failure
```

### Debug Failing Endpoints
When endpoints fail:
```bash
# Get verbose output to see request/response details
python verify_api.py --verbose

# Check server logs for errors
tail -f server.log
```

## Test Coverage

The script tests **22+ endpoints and scenarios**:

| Category | Tests | Coverage |
|----------|-------|----------|
| Health | 2 | 100% |
| Authentication | 6 | 100% |
| Leaderboard | 5 | 100% |
| Live Players | 3 | 100% |
| Security | 3 | 100% |
| **Total** | **22+** | **100%** |

## Exit Codes

- `0` - All tests passed
- `1` - One or more tests failed

## Troubleshooting

### "Cannot connect to http://localhost:8000"
**Problem**: Server is not running or port is incorrect

**Solution**:
```bash
# Start the server in a separate terminal
cd backend
uv run python main.py

# Or specify the correct URL
python verify_api.py --url http://localhost:8001
```

### "Connection timeout"
**Problem**: Server is running but not responding

**Solution**:
1. Check server logs for errors
2. Verify server is fully started
3. Check network connectivity
4. Try with increased timeout (modify script if needed)

### "Test failed: Expected 201, got 400"
**Problem**: API returned unexpected error

**Solution**:
1. Run with `--verbose` flag to see request/response
2. Check server logs for detailed error messages
3. Verify API implementation matches specification
4. Check database state for duplicate entries

### "All tests failed"
**Problem**: Fundamental API issues

**Solution**:
1. Verify server started successfully
2. Check for import errors: `python -m app.main`
3. Verify dependencies installed: `uv sync`
4. Check API configuration in `.env`

## Extending the Script

To add more tests, follow this pattern:

```python
def test_custom_feature(self):
    """Test custom feature"""
    self.log("\n✨ Testing Custom Feature", "INFO")
    print("-" * 70)

    result = self._test(
        "My Custom Test",
        "GET",
        "/my-endpoint",
        200,
    )
    self._print_result(result)
```

Then add the call to `run_all_tests()`:
```python
def run_all_tests(self):
    # ... existing tests ...
    self.test_custom_feature()  # Add your test here
    # ... rest of code ...
```

## Integration with Development Workflow

### Pre-Commit Hook
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
echo "Running API verification..."
python backend/verify_api.py --no-color || exit 1
```

### GitHub Actions
Add to `.github/workflows/test.yml`:
```yaml
- name: Verify API
  run: |
    cd backend
    python verify_api.py --no-color
```

### Local Development
Add to your shell profile:
```bash
alias verify-api="cd backend && python verify_api.py && cd .."
```

Then simply run: `verify-api`

## Performance Notes

- Typical run time: 2-5 seconds
- Each test timeout: 10 seconds
- Response times are measured and reported
- Performance issues highlighted if response > 1s

## Requirements

- Python 3.8+
- `requests` library (HTTP client)
- Running API server on specified URL

## Related Documentation

- [API_SPEC.md](./API_SPEC.md) - Complete API specification
- [README.md](./README.md) - Project setup and overview
- [QUICKSTART.md](./QUICKSTART.md) - Quick reference guide

---

**Created**: December 2024  
**Tested with**: FastAPI 0.104.1, Python 3.11+
