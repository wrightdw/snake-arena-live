#!/usr/bin/env python3
"""
Verify API Script - Tests all endpoints of the running Snake Arena Backend

This script validates that the running server responds correctly to all endpoints,
checks response formats, and ensures data integrity.

Usage:
    python verify_api.py [--url http://localhost:8000] [--verbose]

Options:
    --url         Base URL of the API server (default: http://localhost:8000)
    --verbose     Enable verbose output for debugging
    --no-color    Disable colored output
"""

import requests
import json
import sys
import argparse
from typing import Dict, Tuple, Any, Optional, List
from urllib.parse import urljoin
from dataclasses import dataclass, field
from datetime import datetime


# Color codes for terminal output
class Colors:
    """ANSI color codes for terminal output"""
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    RESET = "\033[0m"
    BOLD = "\033[1m"


@dataclass
class TestResult:
    """Result of a single API test"""
    name: str
    endpoint: str
    method: str
    status: str  # "PASS", "FAIL", "SKIP"
    status_code: Optional[int] = None
    expected_status: Optional[int] = None
    error_message: str = ""
    response_time: float = 0.0
    details: Dict[str, Any] = field(default_factory=dict)

    def is_success(self) -> bool:
        return self.status == "PASS"


class APIVerifier:
    """Comprehensive API verification tool"""

    def __init__(self, base_url: str = "http://localhost:8000", verbose: bool = False, use_colors: bool = True):
        self.base_url = base_url.rstrip("/")
        self.verbose = verbose
        self.use_colors = use_colors
        self.session = requests.Session()
        self.results: List[TestResult] = []
        self.auth_token: Optional[str] = None
        self.test_user_email: Optional[str] = None

    def log(self, message: str, level: str = "INFO"):
        """Log a message with optional colors"""
        if level == "INFO":
            prefix = f"{self._color('ℹ', Colors.BLUE)} " if self.use_colors else "[INFO] "
        elif level == "SUCCESS":
            prefix = f"{self._color('✓', Colors.GREEN)} " if self.use_colors else "[✓] "
        elif level == "ERROR":
            prefix = f"{self._color('✗', Colors.RED)} " if self.use_colors else "[✗] "
        elif level == "WARN":
            prefix = f"{self._color('⚠', Colors.YELLOW)} " if self.use_colors else "[⚠] "
        else:
            prefix = ""

        print(prefix + message)

    def _color(self, text: str, color: str) -> str:
        """Apply color to text if colors are enabled"""
        if not self.use_colors:
            return text
        return f"{color}{text}{Colors.RESET}"

    def _check_connectivity(self) -> bool:
        """Check if the API server is reachable"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=5)
            return response.status_code == 200
        except requests.exceptions.ConnectionError:
            self.log(f"Cannot connect to {self.base_url}", "ERROR")
            return False
        except Exception as e:
            self.log(f"Connection error: {e}", "ERROR")
            return False

    def _url(self, endpoint: str) -> str:
        """Build full URL for an endpoint"""
        return urljoin(self.base_url + "/", endpoint.lstrip("/"))

    def _make_request(
        self, method: str, endpoint: str, **kwargs
    ) -> Tuple[Optional[requests.Response], Optional[float]]:
        """Make HTTP request and measure response time"""
        try:
            url = self._url(endpoint)
            if self.verbose:
                self.log(f"Request: {method} {url}", "INFO")
            
            # Add auth header if token exists
            if self.auth_token and "headers" not in kwargs:
                kwargs["headers"] = {}
            if self.auth_token:
                kwargs.setdefault("headers", {})["Authorization"] = f"Bearer {self.auth_token}"

            start_time = datetime.now()
            response = self.session.request(method, url, timeout=10, **kwargs)
            elapsed = (datetime.now() - start_time).total_seconds()

            if self.verbose:
                self.log(f"Response: {response.status_code} ({elapsed:.3f}s)", "INFO")

            return response, elapsed
        except requests.exceptions.Timeout:
            self.log(f"Request timeout: {endpoint}", "ERROR")
            return None, None
        except requests.exceptions.RequestException as e:
            self.log(f"Request failed: {e}", "ERROR")
            return None, None

    def _test(
        self,
        name: str,
        method: str,
        endpoint: str,
        expected_status: int,
        **kwargs
    ) -> TestResult:
        """Execute a single test"""
        response, elapsed = self._make_request(method, endpoint, **kwargs)

        result = TestResult(
            name=name,
            endpoint=endpoint,
            method=method,
            expected_status=expected_status,
            response_time=elapsed or 0,
        )

        if response is None:
            result.status = "FAIL"
            result.error_message = "No response received"
            return result

        result.status_code = response.status_code

        if response.status_code == expected_status:
            result.status = "PASS"
            try:
                result.details = response.json()
            except:
                result.details = {"raw": response.text}
        else:
            result.status = "FAIL"
            result.error_message = f"Expected {expected_status}, got {response.status_code}"
            try:
                result.details = response.json()
            except:
                result.details = {"raw": response.text}

        self.results.append(result)
        return result

    def _print_result(self, result: TestResult):
        """Print a single test result"""
        if result.status == "PASS":
            status_str = self._color("PASS", Colors.GREEN)
        elif result.status == "SKIP":
            status_str = self._color("SKIP", Colors.YELLOW)
        else:
            status_str = self._color("FAIL", Colors.RED)

        time_str = f"{result.response_time:.3f}s" if result.response_time else "N/A"
        print(f"  [{status_str}] {result.name} ({result.method} {result.endpoint}) - {time_str}")

        if result.status == "FAIL" and result.error_message:
            print(f"       {self._color(result.error_message, Colors.RED)}")

    # ===================== HEALTH CHECKS =====================

    def test_health_checks(self):
        """Test health check endpoints"""
        self.log("\n🏥 Testing Health Checks", "INFO")
        print("-" * 70)

        result = self._test("Health Check", "GET", "/health", 200)
        self._print_result(result)

        result = self._test("Root Endpoint", "GET", "/", 200)
        self._print_result(result)

    # ===================== AUTHENTICATION =====================

    def test_authentication(self):
        """Test authentication endpoints"""
        self.log("\n🔐 Testing Authentication", "INFO")
        print("-" * 70)

        # Signup
        signup_email = f"testuser_{int(datetime.now().timestamp())}@example.com"
        result = self._test(
            "Signup",
            "POST",
            "/auth/signup",
            201,
            json={
                "username": "TestUser",
                "email": signup_email,
                "password": "TestPassword123",
            },
        )
        self._print_result(result)

        if result.status == "PASS":
            self.auth_token = result.details.get("data", {}).get("access_token")
            self.test_user_email = signup_email
            self.log(f"Got auth token: {self.auth_token[:20]}...", "SUCCESS")

        # Login
        result = self._test(
            "Login",
            "POST",
            "/auth/login",
            200,
            json={
                "email": "user1@example.com",
                "password": "password123",
            },
        )
        self._print_result(result)

        if result.status == "PASS" and not self.auth_token:
            self.auth_token = result.details.get("data", {}).get("access_token")
            self.log(f"Got auth token: {self.auth_token[:20]}...", "SUCCESS")

        # Get Current User (requires auth)
        if self.auth_token:
            result = self._test("Get Current User", "GET", "/auth/me", 200)
            self._print_result(result)

            # Logout
            result = self._test("Logout", "POST", "/auth/logout", 200)
            self._print_result(result)

        # Invalid login
        result = self._test(
            "Login Invalid Credentials",
            "POST",
            "/auth/login",
            401,
            json={
                "email": "invalid@example.com",
                "password": "wrongpassword",
            },
        )
        self._print_result(result)

        # Signup duplicate email
        result = self._test(
            "Signup Duplicate Email",
            "POST",
            "/auth/signup",
            400,
            json={
                "username": "AnotherUser",
                "email": "user1@example.com",
                "password": "password123",
            },
        )
        self._print_result(result)

    # ===================== LEADERBOARD =====================

    def test_leaderboard(self):
        """Test leaderboard endpoints"""
        self.log("\n🏆 Testing Leaderboard", "INFO")
        print("-" * 70)

        # Get leaderboard
        result = self._test("Get Leaderboard", "GET", "/leaderboard", 200)
        self._print_result(result)

        # Validate leaderboard structure
        if result.status == "PASS":
            data = result.details.get("data", [])
            if isinstance(data, list) and len(data) > 0:
                entry = data[0]
                required_fields = ["rank", "username", "score", "mode"]
                missing = [f for f in required_fields if f not in entry]
                if missing:
                    self.log(f"Leaderboard entry missing fields: {missing}", "WARN")
                else:
                    self.log(f"Leaderboard has {len(data)} entries", "SUCCESS")

        # Get leaderboard filtered by mode
        result = self._test(
            "Get Leaderboard (walls mode)",
            "GET",
            "/leaderboard?mode=walls",
            200,
        )
        self._print_result(result)

        # Re-authenticate for protected endpoints
        login_result = self._test(
            "[Setup] Login for submit test",
            "POST",
            "/auth/login",
            200,
            json={
                "email": "user1@example.com",
                "password": "password123",
            },
        )
        if login_result.status == "PASS":
            self.auth_token = login_result.details.get("data", {}).get("access_token")

        # Submit score (protected)
        if self.auth_token:
            result = self._test(
                "Submit Score",
                "POST",
                "/leaderboard/submit",
                200,
                json={
                    "score": 150,
                    "mode": "walls",
                },
            )
            self._print_result(result)

            # Submit invalid score
            result = self._test(
                "Submit Invalid Score (negative)",
                "POST",
                "/leaderboard/submit",
                400,
                json={
                    "score": -10,
                    "mode": "walls",
                },
            )
            self._print_result(result)

            # Submit invalid mode
            result = self._test(
                "Submit Invalid Mode",
                "POST",
                "/leaderboard/submit",
                400,
                json={
                    "score": 100,
                    "mode": "invalid_mode",
                },
            )
            self._print_result(result)

    # ===================== LIVE PLAYERS =====================

    def test_live_players(self):
        """Test live players endpoints"""
        self.log("\n👥 Testing Live Players", "INFO")
        print("-" * 70)

        # Get live players
        result = self._test("Get Live Players", "GET", "/live/players", 200)
        self._print_result(result)

        # Validate live players structure
        if result.status == "PASS":
            data = result.details.get("data", [])
            if isinstance(data, list):
                self.log(f"Found {len(data)} live players", "SUCCESS")
                if len(data) > 0:
                    player = data[0]
                    required_fields = ["id", "username", "score", "status"]
                    missing = [f for f in required_fields if f not in player]
                    if missing:
                        self.log(f"Player entry missing fields: {missing}", "WARN")

        # Get specific player (use first player if available)
        if result.status == "PASS":
            data = result.details.get("data", [])
            if len(data) > 0:
                player_id = data[0].get("id")
                if player_id:
                    result = self._test(
                        f"Get Live Player Details",
                        "GET",
                        f"/live/players/{player_id}",
                        200,
                    )
                    self._print_result(result)

        # Get non-existent player
        result = self._test(
            "Get Non-existent Player",
            "GET",
            "/live/players/invalid-player-id",
            404,
        )
        self._print_result(result)

    # ===================== SECURITY & VALIDATION =====================

    def test_security(self):
        """Test security and validation"""
        self.log("\n🔒 Testing Security & Validation", "INFO")
        print("-" * 70)

        # Missing required fields
        result = self._test(
            "Login Missing Email",
            "POST",
            "/auth/login",
            422,
            json={"password": "test"},
        )
        self._print_result(result)

        # Invalid JSON
        result = self._test(
            "Invalid JSON Body",
            "POST",
            "/auth/login",
            422,
            data="invalid json",
            headers={"Content-Type": "application/json"},
        )
        self._print_result(result)

        # Protected endpoint without auth
        # First, clear the auth token
        original_token = self.auth_token
        self.auth_token = None

        result = self._test(
            "Protected Endpoint No Auth",
            "GET",
            "/auth/me",
            403,
        )
        self._print_result(result)

        # Restore token
        self.auth_token = original_token

    # ===================== SUMMARY & REPORTING =====================

    def print_summary(self):
        """Print test summary"""
        total = len(self.results)
        passed = sum(1 for r in self.results if r.status == "PASS")
        failed = sum(1 for r in self.results if r.status == "FAIL")
        skipped = sum(1 for r in self.results if r.status == "SKIP")

        self.log("\n" + "=" * 70, "INFO")
        self.log("📊 Test Summary", "INFO")
        self.log("=" * 70, "INFO")

        print(f"\nTotal Tests:  {total}")
        print(f"  {self._color(f'✓ Passed: {passed}', Colors.GREEN)}")
        print(f"  {self._color(f'✗ Failed: {failed}', Colors.RED)}")
        if skipped:
            print(f"  {self._color(f'⊘ Skipped: {skipped}', Colors.YELLOW)}")

        pass_rate = (passed / total * 100) if total > 0 else 0
        print(f"\n  Pass Rate: {pass_rate:.1f}%")

        if failed > 0:
            print(f"\n{self._color('Failed Tests:', Colors.RED)}")
            for result in self.results:
                if result.status == "FAIL":
                    print(f"  • {result.name}: {result.error_message}")

        print("\n" + "=" * 70)

        return failed == 0

    def run_all_tests(self):
        """Run all test suites"""
        self.log("🚀 Starting API Verification", "INFO")
        self.log(f"Target: {self.base_url}\n", "INFO")

        # Check connectivity
        if not self._check_connectivity():
            self.log("Server is not reachable. Aborting.", "ERROR")
            return False

        self.log("✓ Server is reachable", "SUCCESS")

        # Run test suites
        try:
            self.test_health_checks()
            self.test_authentication()
            self.test_leaderboard()
            self.test_live_players()
            self.test_security()
        except KeyboardInterrupt:
            self.log("\nTests interrupted by user", "WARN")
            return False
        except Exception as e:
            self.log(f"Unexpected error: {e}", "ERROR")
            if self.verbose:
                import traceback
                traceback.print_exc()
            return False

        # Print summary
        return self.print_summary()


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Verify the Snake Arena API server",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python verify_api.py
  python verify_api.py --url http://localhost:8000
  python verify_api.py --verbose
  python verify_api.py --no-color
        """,
    )

    parser.add_argument(
        "--url",
        default="http://localhost:8000",
        help="Base URL of the API server (default: http://localhost:8000)",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose output for debugging",
    )
    parser.add_argument(
        "--no-color",
        action="store_true",
        help="Disable colored output",
    )

    args = parser.parse_args()

    verifier = APIVerifier(
        base_url=args.url,
        verbose=args.verbose,
        use_colors=not args.no_color,
    )

    success = verifier.run_all_tests()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
