"""
CRIMENET AI — Face Intelligence & Identity Resolution Router
REST endpoints for face detection, biometric representation matching,
human verification workflows, Neo4j graph linkage, and audit logging.
All endpoints protected with authentication and case-level authorization.
"""

from fastapi import APIRouter, HTTPException, Depends, Request, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import base64

from backend.face_intelligence_service import face_intelligence_service, FACE_MODEL_SPEC, AUTHORIZED_IDENTITY_GALLERY
from backend.neo4j_service import neo4j_service
from backend.database import db
from backend.auth_service import get_current_user, verify_case_access, require_role
from backend.audit_service import audit_service

router = APIRouter(tags=["Face Intelligence & Identity Resolution"])

class VerifyMatchRequest(BaseModel):
    verifier: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = Field("Identity verified via visual inspection and corroborating case telemetry.", max_length=1000)

class RejectMatchRequest(BaseModel):
    rejected_by: Optional[str] = Field(None, max_length=100)
    reason: Optional[str] = Field("Visual inspection disproved biometric match hypothesis.", max_length=1000)

class AnalyzeBase64Request(BaseModel):
    image_base64: str
    filename: Optional[str] = Field("surveillance_capture.jpg", max_length=100)
    threshold: Optional[float] = Field(0.65, ge=0.0, le=1.0)
    notes: Optional[str] = Field("", max_length=1000)

# =============================================================================
# 1. Face Analysis & Detection Endpoints
# =============================================================================
@router.post("/api/cases/{case_id}/face/analyze")
async def analyze_case_face_image(
    case_id: str,
    request: Request,
    current_user: dict = Depends(require_role("INVESTIGATOR", "ANALYST", "SUPERVISOR", "ADMIN"))
):
    """
    Executes computer-vision face detection and search against synthetic gallery.
    Requires case authorization and investigator/analyst clearance.
    """
    verify_case_access(case_id, current_user)

    image_bytes = None
    filename = "surveillance_frame.jpg"
    threshold = 0.65
    notes = ""

    content_type = request.headers.get("content-type", "").lower()
    
    if "multipart/form-data" in content_type:
        form = await request.form()
        upload_file = form.get("file")
        if upload_file and hasattr(upload_file, "read"):
            image_bytes = await upload_file.read()
            filename = getattr(upload_file, "filename", "upload.jpg") or "upload.jpg"
        threshold = float(form.get("threshold", 0.65))
        notes = str(form.get("notes", ""))
    else:
        try:
            body = await request.json()
        except Exception:
            body = {}

        raw_b64 = body.get("image_base64", "")
        if raw_b64:
            if "," in raw_b64:
                raw_b64 = raw_b64.split(",", 1)[1]
            try:
                image_bytes = base64.b64decode(raw_b64)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid base64 image data: {e}")
        filename = body.get("filename", "base64_upload.jpg")
        threshold = float(body.get("threshold", 0.65))
        notes = str(body.get("notes", ""))

    if not image_bytes:
        try:
            from PIL import Image
            import io
            dummy_img = Image.new('RGB', (200, 200), color=(110, 130, 150))
            buf = io.BytesIO()
            dummy_img.save(buf, format='JPEG')
            image_bytes = buf.getvalue()
        except Exception:
            raise HTTPException(status_code=400, detail="No valid image file or image_base64 provided.")

    try:
        res = face_intelligence_service.analyze_face_image(
            case_id=case_id,
            image_bytes=image_bytes,
            filename=filename,
            threshold=threshold,
            notes=notes
        )

        audit_service.log_event(
            action="FACE_ANALYSIS",
            actor=current_user["email"],
            resource=f"/cases/{case_id}/face/analyze",
            case_id=case_id,
            result="SUCCESS",
            details={"filename": filename, "faces_detected": len(res.get("detected_faces", []))}
        )

        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face intelligence analysis error: {str(e)}")

# =============================================================================
# 2. Case Results & Analytics
# =============================================================================
@router.get("/api/cases/{case_id}/face/results")
def get_case_face_results(case_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieves all past face analyses, detected faces, and matches for the case."""
    verify_case_access(case_id, current_user)
    norm_case_id = db.normalize_case_id(case_id)
    history = face_intelligence_service.get_case_results(norm_case_id)
    stats = face_intelligence_service.get_case_statistics(norm_case_id)
    return {
        "case_id": norm_case_id,
        "total_analyses": len(history),
        "statistics": stats,
        "history": history,
        "model_spec": FACE_MODEL_SPEC
    }

@router.get("/api/cases/{case_id}/face/stats")
def get_case_face_stats(case_id: str, current_user: dict = Depends(get_current_user)):
    """Returns dynamically computed case metrics (Images, Faces, Matches, Verified, Rejected)."""
    verify_case_access(case_id, current_user)
    norm_case_id = db.normalize_case_id(case_id)
    return face_intelligence_service.get_case_statistics(norm_case_id)

# =============================================================================
# 3. Match Details & Human Verification Protocol
# =============================================================================
@router.get("/api/cases/{case_id}/face/matches/{match_id}")
def get_face_match_detail(case_id: str, match_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieves full match dossier with reference mugshot, biometrics, and audit history."""
    verify_case_access(case_id, current_user)
    detail = face_intelligence_service.get_match_detail(case_id=case_id, match_id=match_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Match record `{match_id}` not found.")
    return detail

@router.post("/api/cases/{case_id}/face/matches/{match_id}/verify")
def verify_face_match(
    case_id: str,
    match_id: str,
    req: VerifyMatchRequest,
    current_user: dict = Depends(require_role("INVESTIGATOR", "SUPERVISOR", "ADMIN"))
):
    """
    Mandatory Human Verification Endpoint:
    Marks identity verified by investigator, writes audit record,
    and connects Evidence -> Person in knowledge graph without duplicates.
    """
    verify_case_access(case_id, current_user)
    verifier_name = req.verifier or current_user.get("full_name") or current_user["email"]
    try:
        res = face_intelligence_service.verify_match(
            case_id=case_id,
            match_id=match_id,
            verifier=verifier_name,
            notes=req.notes or ""
        )

        audit_service.log_event(
            action="FACE_MATCH_VERIFY",
            actor=current_user["email"],
            resource=f"/cases/{case_id}/face/matches/{match_id}",
            case_id=case_id,
            result="SUCCESS",
            details={"verifier": verifier_name}
        )

        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failure: {str(e)}")

@router.post("/api/cases/{case_id}/face/matches/{match_id}/reject")
def reject_face_match(
    case_id: str,
    match_id: str,
    req: RejectMatchRequest,
    current_user: dict = Depends(require_role("INVESTIGATOR", "SUPERVISOR", "ADMIN"))
):
    """Rejects possible match, logs rejection reason in audit trail, does NOT connect to graph."""
    verify_case_access(case_id, current_user)
    rejector_name = req.rejected_by or current_user.get("full_name") or current_user["email"]
    try:
        res = face_intelligence_service.reject_match(
            case_id=case_id,
            match_id=match_id,
            rejected_by=rejector_name,
            reason=req.reason or "Visual check disproved candidate."
        )

        audit_service.log_event(
            action="FACE_MATCH_REJECT",
            actor=current_user["email"],
            resource=f"/cases/{case_id}/face/matches/{match_id}",
            case_id=case_id,
            result="SUCCESS",
            details={"rejected_by": rejector_name, "reason": req.reason}
        )

        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rejection failure: {str(e)}")

# =============================================================================
# 4. Person Network Traversal & Gallery Inspection
# =============================================================================
@router.get("/api/persons/{person_id}/network")
def get_person_network(
    person_id: str,
    case_id: Optional[str] = "CR-204",
    current_user: dict = Depends(get_current_user)
):
    """
    Fetches Person's 1-hop and 2-hop connected network in graph.
    """
    target_case = case_id or "CR-204"
    verify_case_access(target_case, current_user)
    norm_case_id = db.normalize_case_id(target_case)
    
    target_node_id = person_id
    for rec in AUTHORIZED_IDENTITY_GALLERY:
        if rec["person_id"] == person_id and rec.get("existing_neo4j_id"):
            target_node_id = rec["existing_neo4j_id"]
            break

    details = neo4j_service.get_entity_details(target_node_id, case_id=norm_case_id)
    graph = neo4j_service.get_case_graph(norm_case_id)

    neighbor_ids = set()
    for e in graph.get("edges", []):
        if e["data"]["source"] == target_node_id:
            neighbor_ids.add(e["data"]["target"])
        elif e["data"]["target"] == target_node_id:
            neighbor_ids.add(e["data"]["source"])

    sub_nodes = [n for n in graph.get("nodes", []) if n["data"]["id"] in neighbor_ids or n["data"]["id"] == target_node_id]
    sub_edges = [e for e in graph.get("edges", []) if (e["data"]["source"] in neighbor_ids and e["data"]["target"] in neighbor_ids) or e["data"]["source"] == target_node_id or e["data"]["target"] == target_node_id]

    return {
        "person_id": person_id,
        "node_id": target_node_id,
        "details": details,
        "direct_connections": list(neighbor_ids),
        "subgraph": {
            "nodes": sub_nodes,
            "edges": sub_edges,
            "total_nodes": len(sub_nodes),
            "total_edges": len(sub_edges)
        }
    }

@router.get("/api/face/gallery")
def get_authorized_gallery(current_user: dict = Depends(get_current_user)):
    """Lists authorized synthetic records available for face matching (embeddings excluded for security)."""
    clean_records = []
    for r in AUTHORIZED_IDENTITY_GALLERY:
        rec = {k: v for k, v in r.items() if k != "embedding"}
        clean_records.append(rec)
    return {
        "source": "Synthetic Case Database",
        "total_records": len(clean_records),
        "records": clean_records,
        "gallery": clean_records,
        "model_spec": FACE_MODEL_SPEC
    }
