"""
CRIMENET AI - Connected System Regression & Integration Suite
Validates the interconnected architecture across:
1. Authentication & In-memory Session Lifecycle
2. RBAC & Clearance Hierarchy (Detective Chen vs. Agent Vance)
3. Multi-tenant Case Isolation & Search Sanitization
4. API Error Normalization & Fail-Closed Enforcement
5. Audit Trail Integrity & Zero Secret Leakage
"""

import sys
from pathlib import Path

# Add project root and backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from fastapi.testclient import TestClient
from backend.main import app
from backend.config import SECRET_KEY, ALGORITHM, DEMO_ACCOUNTS
from backend.auth_service import FAILED_ATTEMPTS, REVOKED_TOKENS, create_access_token
import jwt

client = TestClient(app)

def setup_function():
    FAILED_ATTEMPTS.clear()
    REVOKED_TOKENS.clear()

def test_demo_profiles_endpoint_exposes_no_passwords():
    """Verify /api/auth/demo-profiles returns profile metadata with zero passwords."""
    res = client.get("/api/auth/demo-profiles")
    assert res.status_code == 200
    data = res.json()
    assert "profiles" in data
    profiles = data["profiles"]
    assert len(profiles) >= 3
    for p in profiles:
        assert "password" not in p
        assert "pass" not in p
        assert "password_hash" not in p
        assert "email" in p
        assert "clearance" in p
        assert "role" in p
    print("  [PASS] /api/auth/demo-profiles exposes no passwords or secrets")

def test_demo_login_and_session_validation():
    """Verify demo-login issues valid token, /me validates session, and logout revokes token."""
    res = client.post("/api/auth/demo-login", json={"email": "analyst.vance@crimenet.demo"})
    assert res.status_code == 200
    body = res.json()
    assert "access_token" in body
    token = body["access_token"]
    
    # Session validation /me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    user = me_res.json()
    assert user["email"] == "analyst.vance@crimenet.demo"
    assert "TS/SCI" in user["clearance"] or "TS//SCI" in user["clearance"]
    
    # Revocation / logout
    logout_res = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout_res.status_code == 200
    
    # Reusing revoked token fails with 401
    reused_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert reused_res.status_code == 401
    print("  [PASS] Demo login, /me session validation, and server-side revocation verified")

def test_detective_chen_clearance_and_case_isolation():
    """
    Verify Detective Chen (INVESTIGATOR, SECRET clearance):
    - Cannot access /api/settings (403 Forbidden)
    - Cannot access TS/SCI case 'CASE #CR-2026-0142' (403 Forbidden)
    - Cannot discover TS/SCI entities in /api/search
    """
    login_res = client.post("/api/auth/demo-login", json={"email": "investigator.chen@crimenet.demo"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Accessing settings -> 403 Forbidden
    settings_res = client.get("/api/settings", headers=headers)
    assert settings_res.status_code == 403, f"Expected 403 for Detective Chen, got {settings_res.status_code}"
    print("  [PASS] Detective Chen blocked from /api/settings (403 Forbidden)")
    
    # 2. Accessing restricted case -> 403 Forbidden
    restricted_case_res = client.get("/api/cases/CASE #CR-2026-0142/graph", headers=headers)
    assert restricted_case_res.status_code == 403, f"Expected 403 for unauthorized case, got {restricted_case_res.status_code}"
    print("  [PASS] Detective Chen blocked from TS/SCI case CR-2026-0142 (403 Forbidden)")
    
    # 3. Accessing authorized case CR-204 -> 200 OK
    auth_case_res = client.get("/api/cases/CR-204/graph", headers=headers)
    assert auth_case_res.status_code == 200
    print("  [PASS] Detective Chen access to authorized CR-204 permitted (200 OK)")
    
    # 4. Search results isolated to allowed cases
    search_res = client.get("/api/search?q=Voronin", headers=headers)
    assert search_res.status_code == 200
    results = search_res.json()
    for c in results.get("cases", []):
        assert c["id"] == "CR-204" or "CR-204" in c["id"]
    print("  [PASS] Search isolation: Detective Chen only sees allowed case intelligence")

def test_supervisor_and_admin_elevated_access():
    """Verify Administrator has access to settings, audit logs, and cases."""
    login_res = client.post("/api/auth/demo-login", json={"email": "admin@crimenet.demo"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    settings_res = client.get("/api/settings", headers=headers)
    assert settings_res.status_code == 200
    assert "clearance_standard" in settings_res.json()
    assert settings_res.json()["clearance_standard"] == "TS/SCI-ORCON"
    
    audit_res = client.get("/api/audit/logs", headers=headers)
    assert audit_res.status_code == 200
    assert isinstance(audit_res.json(), list)
    print("  [PASS] Admin elevated access confirmed for settings & audit logs")

def test_nlp_leads_empty_input_validation():
    """Verify NLP leads engine returns 422 on empty or whitespace input (no silent fake mocks)."""
    token, _, _ = create_access_token({
        "sub": "analyst.vance@crimenet.demo",
        "role": "ANALYST",
        "email": "analyst.vance@crimenet.demo"
    })
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Empty text to extract-entities
    res1 = client.post("/api/leads/extract-entities", json={"text": "   ", "case_name": "Test"}, headers=headers)
    assert res1.status_code in [400, 422], f"Expected 422/400 for empty text, got {res1.status_code}"
    
    # 2. Empty text to generate-leads
    res2 = client.post("/api/leads/generate-leads", json={"text": "  ", "case_name": "Test"}, headers=headers)
    assert res2.status_code in [400, 422], f"Expected 422/400 for empty text, got {res2.status_code}"
    print("  [PASS] NLP endpoints fail closed on empty/whitespace input (422)")

def test_search_adversarial_queries():
    """Verify search endpoint handles injection characters and special symbols safely."""
    token, _, _ = create_access_token({
        "sub": "analyst.vance@crimenet.demo",
        "role": "ANALYST",
        "email": "analyst.vance@crimenet.demo",
        "allowed_cases": ["CR-204"]
    })
    headers = {"Authorization": f"Bearer {token}"}
    
    queries = ["' OR '1'='1", "<script>alert(1)</script>", "!@#$%^&*()_+", "   ", "a" * 80]
    for q in queries:
        res = client.get(f"/api/search?q={q}", headers=headers)
        assert res.status_code == 200, f"Search failed on query '{q}': {res.status_code}"
        data = res.json()
        assert "cases" in data
        assert "evidence" in data
        assert "entities" in data
        
    # Oversized queries (>100 chars) are rejected with 422
    oversized = client.get(f"/api/search?q={'a' * 150}", headers=headers)
    assert oversized.status_code == 422
    print("  [PASS] Search resilient to adversarial queries and enforces length boundary (422)")

def test_truthful_health_and_audit_sanitization():
    """Verify health endpoint never fakes LIVE for offline graph, and audit log contains no secrets."""
    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    health = health_res.json()
    assert health["services"]["graph"]["status"] in ["CACHED", "OFFLINE"]
    
    token, _, _ = create_access_token({"sub": "admin@crimenet.demo", "role": "ADMIN", "email": "admin@crimenet.demo"})
    audit_res = client.get("/api/audit/logs", headers={"Authorization": f"Bearer {token}"})
    assert audit_res.status_code == 200
    audit_text = str(audit_res.json())
    for s in ["Crimenet2026!", "Admin2026!", "Investigator2026!", "password_hash"]:
        assert s not in audit_text
    print("  [PASS] Truthful health reporting and audit log sanitization confirmed")

if __name__ == "__main__":
    print("======================================================================")
    print("CRIMENET AI - CONNECTED SYSTEM REGRESSION TEST SUITE")
    print("======================================================================")
    setup_function()
    test_demo_profiles_endpoint_exposes_no_passwords()
    test_demo_login_and_session_validation()
    test_detective_chen_clearance_and_case_isolation()
    test_supervisor_and_admin_elevated_access()
    test_nlp_leads_empty_input_validation()
    test_search_adversarial_queries()
    test_truthful_health_and_audit_sanitization()
    print("======================================================================")
    print("ALL CONNECTED SYSTEM REGRESSION TESTS PASSED SUCCESSFULLY!")
    print("======================================================================")
