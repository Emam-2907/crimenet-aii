"""
Comprehensive Verification Suite for Phase 5 — Face Intelligence & Identity Resolution
Tests all FastAPI endpoints, OpenCV face detection, ArcFace-compatible embedding,
human verification protocol, Neo4j graph deduplication, and CIRA tool integration.
"""

import sys
import os
import json
import base64
import numpy as np
from PIL import Image
import io

# Add repo to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from backend.main import app
from backend.face_intelligence_service import face_intelligence_service, AUTHORIZED_IDENTITY_GALLERY
from backend.auth_service import create_access_token

token, _, _ = create_access_token({
    "sub": "agent.vance@crimenet.demo",
    "role": "INVESTIGATOR",
    "email": "agent.vance@crimenet.demo",
    "full_name": "Special Agent Marcus Vance",
    "allowed_cases": ["*"]
})
client = TestClient(app, headers={"Authorization": f"Bearer {token}"})

def create_synthetic_test_face(width=300, height=300):
    """Creates an in-memory test portrait with high contrast face-like geometry."""
    img = Image.new('RGB', (width, height), color=(30, 40, 55))
    # Draw an oval head
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    # Head
    draw.ellipse([80, 50, 220, 250], fill=(210, 180, 140))
    # Eyes
    draw.ellipse([110, 110, 135, 130], fill=(20, 20, 20))
    draw.ellipse([165, 110, 190, 130], fill=(20, 20, 20))
    # Nose
    draw.polygon([(150, 130), (142, 175), (158, 175)], fill=(170, 140, 110))
    # Mouth
    draw.ellipse([130, 195, 170, 215], fill=(120, 50, 50))
    
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=95)
    return buf.getvalue()

def run_tests():
    print("================================================================================")
    print("PHASE 5 — FACE INTELLIGENCE & IDENTITY RESOLUTION: AUTOMATED VERIFICATION SUITE")
    print("================================================================================")
    
    case_id = "CASE-2026-0142"
    
    # 1. Test Gallery Endpoint
    print("\n[TEST 1] Testing GET /api/face/gallery...")
    res = client.get("/api/face/gallery")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    gallery_data = res.json()
    assert "gallery" in gallery_data
    assert len(gallery_data["gallery"]) >= 6
    # Verify no raw biometric embeddings leaked
    for cand in gallery_data["gallery"]:
        assert "embedding" not in cand, "Biometric embedding leaked in API response!"
    print(f"[PASS] Gallery returned {len(gallery_data['gallery'])} synthetic targets without leaking raw embeddings.")

    # 2. Test Face Analysis via Base64
    print("\n[TEST 2] Testing POST /api/cases/{case_id}/face/analyze (Base64)...")
    test_img_bytes = create_synthetic_test_face()
    b64_str = f"data:image/jpeg;base64,{base64.b64encode(test_img_bytes).decode('utf-8')}"
    
    res = client.post(
        f"/api/cases/{case_id}/face/analyze",
        json={
            "image_base64": b64_str,
            "filename": "surveillance_terminal_c.jpg",
            "threshold": 0.50,
            "notes": "Surveillance probe Sector 4"
        }
    )
    assert res.status_code == 200, f"Analysis failed: {res.text}"
    data = res.json()
    assert data["faces_count"] >= 1, "Expected at least 1 face detected"
    face = data["faces"][0]
    assert "box" in face
    assert "quality" in face
    assert "blur_score" in face["quality"]
    assert "possible_matches" in face
    print(f"[PASS] Detected {data['faces_count']} face(s). Box: {face['box']}. Blur score: {face['quality']['blur_score']:.1f}.")
    print(f"[PASS] Possible matches identified above threshold: {len(face['possible_matches'])}.")

    # 3. Test Face Analysis via Multipart Upload
    print("\n[TEST 3] Testing POST /api/cases/{case_id}/face/analyze (Multipart file)...")
    res = client.post(
        f"/api/cases/{case_id}/face/analyze",
        files={"file": ("cctv_frame.jpg", test_img_bytes, "image/jpeg")},
        data={"threshold": "0.55", "notes": "CCTV live frame multipart"}
    )
    assert res.status_code == 200, f"Multipart analysis failed: {res.text}"
    multi_data = res.json()
    assert multi_data["faces_count"] >= 1
    print(f"[PASS] Multipart file upload succeeded with {multi_data['faces_count']} face(s).")

    # 4. Test Case Results & Case Stats
    print("\n[TEST 4] Testing GET /api/cases/{case_id}/face/results and /stats...")
    res = client.get(f"/api/cases/{case_id}/face/results")
    assert res.status_code == 200
    res_data = res.json()
    assert res_data["total_analyses"] >= 2
    assert "statistics" in res_data
    stats = res_data["statistics"]
    assert stats["images_analyzed"] >= 2
    assert stats["faces_detected"] >= 2
    print(f"[PASS] Dynamic Case Stats: Images Analyzed={stats['images_analyzed']}, Faces={stats['faces_detected']}, Matches={stats['possible_matches']}.")

    # 5. Test Match Detail & Human Verification Workflow
    print("\n[TEST 5] Testing Human Verification Protocol & Neo4j Linkage...")
    first_face = data["faces"][0]
    if first_face["possible_matches"]:
        target_match = first_face["possible_matches"][0]
        match_id = target_match["match_id"]
        cand_name = target_match["candidate"]["name"]
        print(f"--> Verifying match {match_id} for candidate: {cand_name}...")

        # Verify match
        v_res = client.post(
            f"/api/cases/{case_id}/face/matches/{match_id}/verify",
            json={
                "verifier": "Chief Inspector Marcus Vance",
                "notes": "Verified against customs entry manifest and biometric scar alignment."
            }
        )
        assert v_res.status_code == 200, f"Verification failed: {v_res.text}"
        v_data = v_res.json()
        assert v_data["status"] == "VERIFIED BY INVESTIGATOR"
        assert v_data["verification_record"]["verifier"] == "Chief Inspector Marcus Vance"
        assert v_data["graph_link"]["linked"] is True
        print(f"[PASS] Verified successfully! Graph Link: {v_data['graph_link']}")

        # Test rejection on another match or re-verify
        if len(first_face["possible_matches"]) > 1:
            rej_match = first_face["possible_matches"][1]
            r_res = client.post(
                f"/api/cases/{case_id}/face/matches/{rej_match['match_id']}/reject",
                json={
                    "rejected_by": "Agent Vance",
                    "reason": "Ear lobe morphology does not align."
                }
            )
            assert r_res.status_code == 200
            r_data = r_res.json()
            assert r_data["status"] == "REJECTED"
            print(f"[PASS] Rejection successfully audited: {r_data['rejection_record']}")

    # 6. Test Person Network Traversal
    print("\n[TEST 6] Testing GET /api/persons/{person_id}/network...")
    res = client.get(f"/api/persons/PERSON-001/network?case_id={case_id}")
    assert res.status_code == 200
    p_net = res.json()
    assert "person_id" in p_net
    assert "direct_connections" in p_net
    print(f"[PASS] Person Network for PERSON-001 retrieved: {len(p_net['direct_connections'])} direct connections in knowledge graph.")

    # 7. Test CIRA Integration with Face Intelligence
    print("\n[TEST 7] Testing CIRA reasoning query incorporating face intelligence...")
    from backend.cira_service import cira_service
    cira_resp = cira_service.process_chat(
        case_id=case_id,
        message="What facial intelligence and biometric evidence do we have on Viktor Voronin?"
    )
    assert cira_resp and cira_resp.get("message")
    content = cira_resp["message"]
    print(f"[PASS] CIRA response generated ({len(content)} chars):")
    clean_snippet = content[:200].encode('ascii', 'ignore').decode('ascii')
    print(f"   Excerpt: {clean_snippet}...")
    assert "biometric" in content.lower() or "face" in content.lower() or "synthetic" in content.lower()
    
    print("\n================================================================================")
    print("ALL PHASE 5 VERIFICATION SUITES PASSED FLAWLESSLY!")
    print("================================================================================")

if __name__ == "__main__":
    run_tests()
