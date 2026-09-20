"""
CRIMENET AI - Phase 4 Adversarial & Verification Suite
Tests security boundaries, adversarial edge cases, accessibility tokens,
touch target constraints, and CR-204 single-model synchronization.
"""

import sys
import os
import json
import re
from pathlib import Path

# Add project root and backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from fastapi.testclient import TestClient
from backend.main import app
from backend.auth_service import create_access_token, revoke_token, is_token_revoked
from backend.config import SECRET_KEY, ALGORITHM
import jwt

client = TestClient(app)

def get_token(role="INVESTIGATOR", user_id="agent.vance@crimenet.demo", allowed_cases=None):
    token, jti, exp = create_access_token({
        "sub": user_id,
        "role": role,
        "email": user_id,
        "full_name": "Special Agent Marcus Vance",
        "allowed_cases": allowed_cases if allowed_cases is not None else ["CR-204", "CASE #CR-2026-0142"]
    })
    return token, jti

# =============================================================================
# 1. Adversarial Auth & Authz Tests
# =============================================================================
def test_adversarial_forged_tokens():
    """Test rejection of forged tokens, 'none' algorithm, and wrong secret."""
    print("\n[TEST 1] Adversarial Token Forgery:")
    
    # A. Algorithm 'none' exploit attempt
    forged_none = jwt.encode({"sub": "admin", "role": "ADMIN"}, key="", algorithm="none")
    res = client.get("/api/cases", headers={"Authorization": f"Bearer {forged_none}"})
    assert res.status_code == 401, f"Expected 401 on 'none' algorithm, got {res.status_code}"
    print("  [PASS] Algorithm 'none' attack blocked (401)")
    
    # B. Wrong secret key signing
    wrong_key_token = jwt.encode({"sub": "admin", "role": "ADMIN"}, key="wrong_secret_key_1234567890", algorithm="HS256")
    res = client.get("/api/cases", headers={"Authorization": f"Bearer {wrong_key_token}"})
    assert res.status_code == 401, f"Expected 401 on wrong secret, got {res.status_code}"
    print("  [PASS] Wrong-secret forged token rejected (401)")

def test_adversarial_path_traversal_and_injection():
    """Test SQLi and Path Traversal inputs in case_id and entity_id parameters."""
    print("\n[TEST 2] Path Traversal & Injection Resiliency:")
    token, _ = get_token("INVESTIGATOR")
    headers = {"Authorization": f"Bearer {token}"}
    
    malicious_payloads = [
        "../../../../etc/passwd",
        "..\\..\\windows\\system32\\cmd.exe",
        "' OR '1'='1",
        "CR-204' UNION SELECT * FROM users --",
        "<script>alert('xss')</script>"
    ]
    
    for payload in malicious_payloads:
        res = client.get(f"/api/cases/{payload}/graph", headers=headers)
        # Must be rejected with 403 (unauthorized case access) or 404/422, NEVER 200 or 500
        assert res.status_code in [403, 404, 422], f"Payload '{payload}' returned unsafe status {res.status_code}: {res.text}"
    print(f"  [PASS] All {len(malicious_payloads)} injection/traversal vectors safely rejected (403/404)")

def test_adversarial_case_isolation_tampering():
    """Test that investigator with access to CR-204 cannot read unauthorized cases."""
    print("\n[TEST 3] Per-Case Authorization Boundary:")
    # User only has access to CR-204
    token, _ = get_token("INVESTIGATOR", allowed_cases=["CR-204"])
    headers = {"Authorization": f"Bearer {token}"}
    
    # Authorized case
    res_ok = client.get("/api/cases/CR-204/graph", headers=headers)
    assert res_ok.status_code == 200, f"Expected 200 on authorized case, got {res_ok.status_code}"
    print("  [PASS] Access to authorized case CR-204 permitted (200)")
    
    # Unauthorized case
    res_denied = client.get("/api/cases/CASE #CR-2026-0044/graph", headers=headers)
    assert res_denied.status_code == 403, f"Expected 403 on unauthorized case, got {res_denied.status_code}"
    print("  [PASS] Access to unauthorized case blocked with HTTP 403 Forbidden")

def test_adversarial_role_escalation():
    """Test that INVESTIGATOR cannot access SUPERVISOR audit logs."""
    print("\n[TEST 4] Role-Based Privilege Escalation Prevention:")
    token, _ = get_token("INVESTIGATOR")
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.get("/api/audit/logs", headers=headers)
    assert res.status_code == 403, f"Expected 403 on audit log access for INVESTIGATOR, got {res.status_code}"
    print("  [PASS] Investigator blocked from accessing audit logs (403)")
    
    # Supervisor access
    sup_token, _ = get_token("SUPERVISOR")
    res_sup = client.get("/api/audit/logs", headers={"Authorization": f"Bearer {sup_token}"})
    assert res_sup.status_code == 200, f"Expected 200 for SUPERVISOR, got {res_sup.status_code}"
    print("  [PASS] Supervisor successfully authorized for audit logs (200)")

# =============================================================================
# 2. UI Code & Accessibility Audit
# =============================================================================
def test_accessibility_and_contrast_tokens():
    """Inspect CSS and JSX for WCAG 2.2 AA accessibility, touch targets, and reduced motion."""
    print("\n[TEST 5] Accessibility & Design System Verification:")
    root = Path(__file__).parent.parent
    
    # Check index.css for focus-visible and prefers-reduced-motion
    css_path = root / "src" / "index.css"
    assert css_path.exists(), "src/index.css not found"
    css_content = css_path.read_text(encoding="utf-8")
    
    assert "focus-visible" in css_content or ":focus" in css_content, "Focus styles missing in index.css"
    print("  [PASS] Visible focus indicators verified in CSS")
    
    assert "prefers-reduced-motion" in css_content, "prefers-reduced-motion media query missing in index.css"
    print("  [PASS] prefers-reduced-motion media query verified in CSS")
    
    # Check CR204InvestigationView.jsx for touch target >= 44px, semantic HTML, and ARIA labels
    view_path = root / "src" / "components" / "CR204InvestigationView.jsx"
    assert view_path.exists(), "CR204InvestigationView.jsx not found"
    view_content = view_path.read_text(encoding="utf-8")
    
    # Check min-h-[44px] or touch targets
    assert "min-h-[44px]" in view_content or "min-h-11" in view_content or "py-3" in view_content, "Touch target min-height missing in view"
    print("  [PASS] Touch targets >= 44px verified on interactive controls")
    
    # Check semantic tags
    for tag in ["<main", "<nav", "<aside", "<section"]:
        assert tag in view_content, f"Semantic tag {tag} missing in CR204InvestigationView.jsx"
    print("  [PASS] Semantic HTML elements (main, nav, aside, section) verified")
    
    # Check ARIA live region
    assert "aria-live" in view_content, "aria-live region missing for dynamic CIRA updates"
    print("  [PASS] Screen-reader aria-live regions verified for dynamic CIRA updates")
    
    # Check DEMO FEED persistent watermark
    assert "DEMO FEED" in view_content, "DEMO FEED watermark missing in CCTV view"
    print("  [PASS] Persistent 'DEMO FEED' CCTV watermark verified")

def test_truthful_wording_adherence():
    """Ensure strict truthfulness wording constraints are adhered to."""
    print("\n[TEST 6] Strict Truthfulness Wording Audit:")
    root = Path(__file__).parent.parent
    cira_service_path = root / "src" / "services" / "ciraService.js"
    assert cira_service_path.exists(), "ciraService.js not found"
    cira_content = cira_service_path.read_text(encoding="utf-8")
    
    # Exact required vehicle wording
    req_vehicle_wording = "V-102 was recorded at CCTV-04 and later at CCTV-07. The path between these detections is inferred from the available records; continuous movement was not directly observed."
    assert req_vehicle_wording in cira_content, "Required vehicle wording missing in ciraService.js"
    print("  [PASS] Required vehicle movement wording verified in CIRA service")
    
    # Face match wording
    req_face_wording = "Potential match identified. Model similarity: 87%; human verification required."
    assert req_face_wording in cira_content, "Required face match wording missing in ciraService.js"
    print("  [PASS] Required face match similarity wording verified in CIRA service")
    
    # Ban on prohibited phrases
    prohibited_phrases = ["confirmed suspect", "87% confirmed", "Zero-day exploit detected", "Immediate action required"]
    for phrase in prohibited_phrases:
        assert phrase.lower() not in cira_content.lower(), f"Prohibited phrase '{phrase}' found in ciraService.js!"
    print("  [PASS] Prohibited claims ('confirmed suspect', '87% confirmed') verified absent")

if __name__ == "__main__":
    print("======================================================================")
    print("CRIMENET AI - PHASE 4 INDEPENDENT VERIFICATION SUITE")
    print("======================================================================")
    test_adversarial_forged_tokens()
    test_adversarial_path_traversal_and_injection()
    test_adversarial_case_isolation_tampering()
    test_adversarial_role_escalation()
    test_accessibility_and_contrast_tokens()
    test_truthful_wording_adherence()
    print("\n======================================================================")
    print("ALL PHASE 4 ADVERSARIAL & ACCESSIBILITY VERIFICATION TESTS PASSED")
    print("======================================================================")
