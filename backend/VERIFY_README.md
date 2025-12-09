# 🚀 API Verification System - README

## What Was Added?

A complete **automated API verification system** for testing the Snake Arena backend.

**New Files**:
- `verify_api.py` - Main verification script (570 lines)
- `VERIFY_API.md` - Complete documentation
- `VERIFY_QUICK_START.md` - Quick start guide  
- `VERIFY_IMPLEMENTATION.md` - Implementation details
- `VERIFY_ADDED_FILES.md` - Files summary

## Quick Start (30 seconds)

### 1. Ensure requests is installed
```bash
uv sync
```

### 2. Start the server (in one terminal)
```bash
uv run python main.py
```

### 3. Run verification (in another terminal)
```bash
python verify_api.py
```

## What It Tests

✅ **22+ automated tests** across all endpoints:
- Health checks (2)
- Authentication (6)
- Leaderboard (5)  
- Live players (3)
- Security (3)
- Plus validation tests

## Key Features

- 🎨 Color-coded results (pass/fail/skip)
- ⚡ Response time measurement
- 🔍 Data structure validation
- 🛡️ Security testing
- 📊 Summary report
- 🔧 Verbose debugging mode
- 🌐 Custom server URLs
- 🚀 CI/CD ready

## Usage Examples

```bash
# Default (test localhost:8000)
python verify_api.py

# Custom server
python verify_api.py --url http://api.example.com:8000

# Debug mode (show request/response details)
python verify_api.py --verbose

# CI/CD mode (machine-readable)
python verify_api.py --no-color
```

## Documentation

| Document | Purpose |
|----------|---------|
| `VERIFY_QUICK_START.md` | How to use (5 min read) |
| `VERIFY_API.md` | Complete guide (15 min read) |
| `VERIFY_IMPLEMENTATION.md` | What was built (10 min read) |
| `verify_api.py` | Source code (570 lines) |

## Output Example

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
  [PASS] Login (POST /auth/login) - 0.038s
  [PASS] Get Current User (GET /auth/me) - 0.022s
  [PASS] Logout (POST /auth/logout) - 0.018s

🏆 Testing Leaderboard
----------------------------------------------------------------------
  [PASS] Get Leaderboard (GET /leaderboard) - 0.028s
  [PASS] Get Leaderboard (walls mode) (GET /leaderboard?mode=walls) - 0.021s
  [PASS] Submit Score (POST /leaderboard/submit) - 0.035s

👥 Testing Live Players
----------------------------------------------------------------------
  [PASS] Get Live Players (GET /live/players) - 0.019s
  [PASS] Get Player Details (GET /live/players/{id}) - 0.023s

🔒 Testing Security & Validation
----------------------------------------------------------------------
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

## Integration with Your Workflow

### Before Committing
```bash
python verify_api.py
```

### CI/CD Pipeline
```yaml
- name: Verify API
  run: python backend/verify_api.py --no-color
```

### Development Alias
```bash
# Add to ~/.bashrc or ~/.zshrc
alias verify-api="python /workspaces/snake-arena-live/backend/verify_api.py"

# Then use: verify-api --verbose
```

## Exit Codes

- `0` - All tests passed ✓
- `1` - One or more tests failed ✗

## Troubleshooting

### "Cannot connect to localhost:8000"
→ Start the server: `uv run python main.py`

### "Tests failing"
→ Run with `--verbose` to see details: `python verify_api.py --verbose`

### "All tests failed"
→ Check server logs: `tail -n 50 server.log` (if logging enabled)

## Requirements

- Python 3.8+
- `requests` library (install: `uv sync`)
- Running API server

## Files at a Glance

```
backend/
├── verify_api.py                 # Main script - run this! ⭐
├── VERIFY_QUICK_START.md         # Get started (this first!)
├── VERIFY_API.md                 # Full documentation
├── VERIFY_IMPLEMENTATION.md      # Technical details
└── VERIFY_ADDED_FILES.md         # Files summary
```

## Next Steps

1. **Try it now**:
   ```bash
   python verify_api.py
   ```

2. **For detailed info**, read:
   - Quick start: `VERIFY_QUICK_START.md`
   - Full guide: `VERIFY_API.md`

3. **Add to your workflow**:
   - Run before commits
   - Integrate with CI/CD
   - Use for deployment checks

## Support

**For questions or issues**:

1. Check `VERIFY_QUICK_START.md` for common tasks
2. Check `VERIFY_API.md` troubleshooting section
3. Run with `--verbose` flag for debugging
4. Review `verify_api.py` source code

---

**Status**: ✅ Production Ready  
**Created**: December 2024  
**Location**: `/workspaces/snake-arena-live/backend/`

**Get started**: `python verify_api.py`
