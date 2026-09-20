import sys
from pathlib import Path

# Add project root to sys.path
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

import traceback
from tests.test_security_phase2 import (
    reset_auth_state,
    test_valid_login,
    test_invalid_login_generic_error,
    test_login_rate_limiting,
    test_expired_session_rejected,
    test_logout_invalidates_session,
    test_unauthenticated_api_rejection,
    test_rbac_role_enforcement,
    test_per_case_authorization,
    test_truthful_health_checks,
    test_audit_logging,
    test_security_headers
)
from backend.auth_service import FAILED_ATTEMPTS, REVOKED_TOKENS

test_cases = [
    ("1. Valid Login with Token & Cookie", test_valid_login),
    ("2. Invalid Login Returns Generic Error", test_invalid_login_generic_error),
    ("3. Login Rate Limiting (429 Lockout)", test_login_rate_limiting),
    ("4. Expired Session Rejected (401)", test_expired_session_rejected),
    ("5. Logout Token Invalidation / Revocation", test_logout_invalidates_session),
    ("6. Unauthenticated Direct API Access Blocked (401)", test_unauthenticated_api_rejection),
    ("7. RBAC Role-Based Access Enforcement (403)", test_rbac_role_enforcement),
    ("8. Per-Case Authorization Isolation (403)", test_per_case_authorization),
    ("9. Truthful Health Checks (Never Fake LIVE)", test_truthful_health_checks),
    ("10. Append-Only Server-Controlled Audit Logging", test_audit_logging),
    ("11. Security Headers & Explicit CORS", test_security_headers),
]

def run():
    print("=" * 70)
    print("CRIMENET AI - PHASE 2 SECURITY CONTROLS TEST SUITE")
    print("=" * 70)

    passed = 0
    failed = 0

    for name, fn in test_cases:
        # Reset auth state
        FAILED_ATTEMPTS.clear()
        REVOKED_TOKENS.clear()
        try:
            fn()
            print(f"[PASS] {name}")
            passed += 1
        except Exception as e:
            print(f"[FAIL] {name}")
            print(f"       Error: {e}")
            traceback.print_exc()
            failed += 1

    print("=" * 70)
    print(f"RESULTS: {passed} PASSED, {failed} FAILED, 0 NOT TESTED")
    print("=" * 70)

    if failed > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    run()
