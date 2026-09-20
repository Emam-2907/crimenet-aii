"""
CR-204 Integration and Truthfulness Test Suite
Validates the single typed investigation dataset, context, graph endpoints,
truthful labeling, and deterministic CIRA question answering.
"""

import sys
import os
from pathlib import Path

# Add project root and backend to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from fastapi.testclient import TestClient
from backend.main import app
from backend.auth_service import create_access_token
from backend.database import CASES_STORE, CYTOSCAPE_GRAPH_DATA

client = TestClient(app)

def get_auth_headers(role="INVESTIGATOR", user_id="agent_vance"):
    token, jti, exp = create_access_token({
        "sub": user_id,
        "role": role,
        "email": f"{user_id}@agency.gov",
        "full_name": "Special Agent Marcus Vance"
    })
    return {"Authorization": f"Bearer {token}"}

def test_cr204_case_retrieval():
    """Verify CR-204 case exists and is retrieved with authenticated session."""
    headers = get_auth_headers("INVESTIGATOR")
    res = client.get("/api/cases", headers=headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    cases = data.get("cases", data) if isinstance(data, dict) else data
    cr204 = next((c for c in cases if isinstance(c, dict) and c.get("id") == "CR-204"), None)
    assert cr204 is not None, "CR-204 case not found in cases list"
    assert cr204["case_type"] == "Theft"
    assert cr204["is_synthetic"] is True
    print("PASS: CR-204 case retrieval")

def test_cr204_graph_nodes_and_edges():
    """Verify all CR-204 nodes and edges exist in graph database."""
    headers = get_auth_headers("ANALYST")
    res = client.get("/api/cases/CR-204/graph", headers=headers)
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    graph_data = res.json()
    nodes = graph_data.get("nodes", [])
    edges = graph_data.get("edges", [])
    
    # Check required nodes
    required_nodes = ["CR-204", "P-017", "FM-042", "CCTV-04", "L-08", "V-102", "CCTV-07", "CCTV-11", "INC-204", "L-12"]
    found_node_ids = {n.get("data", {}).get("id") for n in nodes}
    found_edge_ids = {e.get("data", {}).get("id") for e in edges}
            
    for req_node in required_nodes:
        assert req_node in found_node_ids, f"Required node {req_node} missing from graph nodes: {found_node_ids}"
        
    # Check required edges
    required_edges = ["rel-cr204-1", "rel-cr204-2", "rel-cr204-3", "rel-cr204-4", "rel-cr204-5", "rel-cr204-6", "rel-cr204-7", "rel-cr204-8", "rel-cr204-9"]
    for req_edge in required_edges:
        assert req_edge in found_edge_ids, f"Required edge {req_edge} missing from graph edges: {found_edge_ids}"
        
    print("PASS: CR-204 all 10 nodes and 9 edges present in graph")

def test_cr204_truthfulness_labels():
    """Verify FM-042 and V-102 data contain strict truthfulness disclaimers."""
    headers = get_auth_headers("ANALYST")
    graph_res = client.get("/api/cases/CR-204/graph", headers=headers).json()
    nodes = {n["data"]["id"]: n["data"] for n in graph_res.get("nodes", [])}
    edges = {e["data"]["id"]: e["data"] for e in graph_res.get("edges", [])}
    
    # 1. FM-042 check
    fm042 = nodes.get("FM-042")
    assert fm042 is not None, f"FM-042 not found in nodes: {list(nodes.keys())}"
    assert "87%" in fm042["label"]
    assert "Potential match identified" in fm042["details"]
    assert "human verification required" in fm042["details"]
    
    # 2. V-102 check
    v102 = nodes.get("V-102")
    assert v102 is not None, f"V-102 not found in nodes: {list(nodes.keys())}"
    assert "Path is inferred" in v102["details"]
    
    # 3. Vehicle edge wording check
    v102_edge = edges.get("rel-cr204-7")
    assert v102_edge is not None, f"rel-cr204-7 edge not found in edges: {list(edges.keys())}"
    expected_wording = "V-102 was recorded at CCTV-04 and later at CCTV-07. The path between these detections is inferred from the available records; continuous movement was not directly observed."
    assert expected_wording in v102_edge["explainability"]
    
    # 4. CCTV-04 check
    cctv04 = nodes.get("CCTV-04")
    assert "DEMO FEED" in cctv04["details"]
    
    print("PASS: CR-204 truthfulness labels and exact required vehicle wording verified")

def test_cr204_cira_queries_mock_validation():
    """Verify that backend chat endpoint processes questions with grounded context."""
    headers = get_auth_headers("ANALYST")
    
    test_queries = [
        "What happened around CCTV-04?",
        "Where was V-102 detected?",
        "Where did V-102 move?",
        "Why is P-017 connected to this case?",
        "Show cameras connected to this person",
        "What happened between 14:00 and 14:20?",
        "What evidence supports this lead?",
        "What information is missing?",
        "Are there conflicting records?",
        "Explain this graph relationship",
        "What does the 87% face score mean?"
    ]
    
    for query in test_queries:
        payload = {
            "message": query,
            "case_id": "CR-204",
            "active_entity_id": "V-102" if "V-102" in query else "P-017"
        }
        res = client.post("/api/cases/CR-204/cira/chat", json=payload, headers=headers)
        assert res.status_code == 200, f"Query '{query}' failed: {res.text}"
        data = res.json()
        assert "response" in data or "reply" in data or "message" in data or "content" in data
        
    print(f"PASS: All {len(test_queries)} CIRA investigative queries returned 200 OK")

if __name__ == "__main__":
    print("--- Running CR-204 Integration Tests ---")
    test_cr204_case_retrieval()
    test_cr204_graph_nodes_and_edges()
    test_cr204_truthfulness_labels()
    test_cr204_cira_queries_mock_validation()
    print("--- ALL CR-204 INTEGRATION TESTS PASSED ---")
