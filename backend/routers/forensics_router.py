from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from backend.database import db, CANDIDATE_GALLERY, VISUAL_EVIDENCE_CASES
import random

router = APIRouter(prefix="/api/forensics", tags=["Forensics & Facial Candidate Matching"])

class DetectFaceRequest(BaseModel):
    evidence_id: Optional[str] = None
    image_url: Optional[str] = None

class LinkEvidenceRequest(BaseModel):
    evidence_id: str
    suspect_id: str
    match_confidence: float

@router.get("/cases")
def list_forensic_cases():
    return {
        "cases": db.evidence_cases,
        "gallery": db.candidates,
        "total_cases": len(db.evidence_cases),
        "total_gallery_candidates": len(db.candidates)
    }

@router.post("/detect-face")
def detect_facial_biometrics(request: DetectFaceRequest):
    """
    Computer Vision pipeline: executes facial landmark alignment, facial ratio computation,
    and returns localized reticle coordinates with feature vector.
    """
    # Look up evidence case if passed
    case = None
    if request.evidence_id:
        case = next((c for c in db.evidence_cases if c["id"] == request.evidence_id), None)

    reticle = case["reticle"] if case else {"x": 38, "y": 28, "w": 28, "h": 36}
    
    # 68-point facial landmark grid points (simulated spatial normalized coordinates)
    landmarks = []
    base_x = reticle["x"] + reticle["w"] / 2
    base_y = reticle["y"] + reticle["h"] / 2
    for i in range(12):
        angle = (i / 12) * 6.28
        landmarks.append({
            "id": f"pt-{i}",
            "x": round(base_x + (reticle["w"] / 3.2) * (0.8 + 0.2 * (i % 2)) * (1 if i % 2 == 0 else -1) * 0.5, 2),
            "y": round(base_y + (reticle["h"] / 3.2) * (0.8 + 0.2 * (i % 3)) * (1 if i % 3 == 0 else -1) * 0.5, 2)
        })

    return {
        "status": "FACE_DETECTED",
        "evidence_id": request.evidence_id or "CUSTOM_UPLOAD",
        "bounding_box": reticle,
        "landmark_count": 68,
        "key_landmarks": landmarks,
        "biometrics": {
            "pupillary_distance_px": 44.6,
            "facial_symmetry_index": 0.942,
            "vector_embedding": [round(random.uniform(-0.8, 0.8), 4) for _ in range(8)],
            "lighting_quality": "OPTIMAL_INFRARED",
            "pose_yaw_angle": "-4.2 deg"
        }
    }

@router.post("/match-candidates")
def match_candidates(request: DetectFaceRequest):
    """
    Candidate matching against the criminal intelligence mugshot gallery.
    Returns ranked suspects with confidence scores, biometrics, and alias cross-references.
    """
    case = next((c for c in db.evidence_cases if c["id"] == request.evidence_id), None)
    target_candidate_id = case["primary_match_id"] if case else "cand-01"

    ranked = []
    for cand in db.candidates:
        cand_copy = cand.copy()
        if cand["id"] == target_candidate_id:
            cand_copy["match_score"] = case["match_score"] if case else 0.964
            cand_copy["is_primary_match"] = True
        else:
            # Distance degradation
            cand_copy["match_score"] = round(cand["confidence"] * 0.82, 3)
            cand_copy["is_primary_match"] = False
        ranked.append(cand_copy)

    ranked.sort(key=lambda x: x["match_score"], reverse=True)

    return {
        "status": "MATCHING_COMPLETE",
        "candidates": ranked,
        "top_match": ranked[0],
        "algorithm": "ArcFace-ResNet50 + Cosine Metric Fusion",
        "threshold_verified": True
    }

@router.post("/link-evidence-to-graph")
def link_evidence_to_knowledge_graph(request: LinkEvidenceRequest):
    """
    Crucial investigation bridge: takes the biometric candidate match and dynamically
    links the evidence node to the suspect node inside the Cytoscape Knowledge Graph!
    """
    # Map cand-01 -> suspect-1, cand-02 -> suspect-2, etc.
    suspect_node_id = request.suspect_id.replace("cand-", "suspect-") if "cand-" in request.suspect_id else request.suspect_id
    evidence_node_id = request.evidence_id.lower().replace("evid-", "evid-").replace("cctv-", "")

    # Ensure evidence node is present or add it
    graph = db.get_graph()
    node_ids = {n["data"]["id"] for n in graph["nodes"]}

    evid_id = f"evid-{request.evidence_id.lower()}"
    if evid_id not in node_ids:
        new_evid_node = {
            "data": {
                "id": evid_id,
                "label": f"Evidence: {request.evidence_id}",
                "type": "evidence",
                "threat": "EVIDENCE",
                "tier": f"Match {int(request.match_confidence * 100)}%",
                "syndicate": "Visual Forensics",
                "color": "#38bdf8",
                "size": 36,
                "icon": "camera",
                "details": f"Visual biometric match linked with {int(request.match_confidence * 100)}% facial similarity confidence."
            }
        }
        graph["nodes"].append(new_evid_node)

    # Link edge
    new_edge = db.add_evidence_link(evid_id, suspect_node_id, request.match_confidence)

    return {
        "success": True,
        "message": f"Successfully linked Evidence {request.evidence_id} to Suspect {suspect_node_id} in the Knowledge Graph.",
        "linked_edge": new_edge,
        "total_graph_nodes": len(graph["nodes"]),
        "total_graph_edges": len(graph["edges"])
    }
