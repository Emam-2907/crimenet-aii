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
    
    # 4. Search results isolated to allowed cases — including entities/evidence
    search_res = client.get("/api/search?q=Voronin", headers=headers)
    assert search_res.status_code == 200
    results = search_res.json()
    for c in results.get("cases", []):
        assert c["id"] == "CR-204" or "CR-204" in c["id"]
    leaked_entity_ids = {"ent-person-voronin"}
    for ent in results.get("entities", []):
        assert ent.get("id") not in leaked_entity_ids, f"TS/SCI entity leaked in search: {ent}"
        cid = str(ent.get("case_id", "")).replace("CASE #", "").strip().upper()
        assert cid == "CR-204", f"Entity from unauthorized case leaked: {ent}"
    for e in results.get("evidence", []):
        cid = str(e.get("case_id", "")).replace("CASE #", "").strip().upper()
        assert cid == "CR-204", f"Evidence from unauthorized case leaked: {e}"
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

def test_flexible_identifier_logins():
    """Verify login works via Badge ID, Full Name, short alias, and standard demo password."""
    # 1. Badge ID
    res = client.post("/api/auth/login", json={"user_id": "CN-ALPHA-0941", "password": "demo123"})
    assert res.status_code == 200, f"Failed badge ID login: {res.text}"
    assert res.json()["user"]["email"] == "analyst.vance@crimenet.demo"
    
    # 2. Full Name
    res2 = client.post("/api/auth/login", json={"user_id": "Marcus Vance", "password": "demo123"})
    assert res2.status_code == 200, f"Failed full name login: {res2.text}"
    assert res2.json()["user"]["email"] == "analyst.vance@crimenet.demo"
    
    # 3. Short alias
    res3 = client.post("/api/auth/login", json={"user_id": "chen", "password": "demo123"})
    assert res3.status_code == 200, f"Failed short alias login: {res3.text}"
    assert res3.json()["user"]["email"] == "investigator.chen@crimenet.demo"
    
    # 4. Demo login endpoint with badge ID
    res4 = client.post("/api/auth/demo-login", json={"email": "CN-INV-5512"})
    assert res4.status_code == 200, f"Failed demo login with badge: {res4.text}"
    assert res4.json()["user"]["email"] == "investigator.chen@crimenet.demo"
    print("  [PASS] Flexible identifier login (Badge ID, Full Name, Short Alias) confirmed")

def test_case_entities_relationships_and_graph():
    """Verify case detail returns complete set of entities and relationships matching graph topology."""
    login_res = client.post("/api/auth/login", json={"user_id": "analyst.vance@crimenet.demo", "password": "demo123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Case detail
    case_res = client.get("/api/cases/CR-204", headers=headers)
    assert case_res.status_code == 200
    case_data = case_res.json()
    assert len(case_data.get("entities", [])) >= 15, f"Expected at least 15 entities, got {len(case_data.get('entities', []))}"
    assert len(case_data.get("relationships", [])) >= 27, f"Expected at least 27 relationships, got {len(case_data.get('relationships', []))}"
    
    # Explicit entities endpoint
    ent_res = client.get("/api/cases/CR-204/entities", headers=headers)
    assert ent_res.status_code == 200
    assert ent_res.json()["total"] >= 15
    
    # Explicit relationships endpoint
    rel_res = client.get("/api/cases/CR-204/relationships", headers=headers)
    assert rel_res.status_code == 200
    assert rel_res.json()["total"] >= 27
    
    # Graph analytics endpoint
    analytics_res = client.get("/api/cases/CR-204/graph/analytics", headers=headers)
    assert analytics_res.status_code == 200
    assert analytics_res.json().get("total_entities", 0) >= 15
    
    # Graph path endpoint
    path_res = client.post("/api/cases/CR-204/graph/path", json={"source_id": "suspect-1", "target_id": "suspect-2", "max_hops": 5}, headers=headers)
    assert path_res.status_code == 200
    print("  [PASS] Case CR-204 complete entities (15+), relationships (27+), and graph analytics verified")

def test_entity_resolution_merge_in_demo_mode():
    """Verify entity resolution merge works without 503 error in demo mode."""
    login_res = client.post("/api/auth/login", json={"user_id": "analyst.vance@crimenet.demo", "password": "demo123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    cases_res = client.get("/api/entity-resolution/cases", headers=headers)
    assert cases_res.status_code == 200
    assert len(cases_res.json().get("cases", [])) > 0
    
    merge_res = client.post("/api/entity-resolution/merge", json={
        "case_id": "CR-204",
        "primary_id": "suspect-1",
        "alias_name": "Cypher-9 Test Alias",
        "match_score": 0.95
    }, headers=headers)
    assert merge_res.status_code == 200, f"Expected 200, got {merge_res.status_code}: {merge_res.text}"
    assert merge_res.json()["success"] is True
    print("  [PASS] Entity resolution merge verified operational in demo mode (no 503)")

if __name__ == "__main__":
    print("======================================================================")
    print("CRIMENET AI - CONNECTED SYSTEM REGRESSION TEST SUITE")
    print("======================================================================")
    setup_function()
    test_demo_profiles_endpoint_exposes_no_passwords()
    test_demo_login_and_session_validation()
    test_flexible_identifier_logins()
    test_detective_chen_clearance_and_case_isolation()
    test_supervisor_and_admin_elevated_access()
    test_nlp_leads_empty_input_validation()
    test_search_adversarial_queries()
    test_case_entities_relationships_and_graph()
    test_entity_resolution_merge_in_demo_mode()
    test_truthful_health_and_audit_sanitization()
    print("======================================================================")
    print("ALL CONNECTED SYSTEM REGRESSION TESTS PASSED SUCCESSFULLY!")
    print("======================================================================")
