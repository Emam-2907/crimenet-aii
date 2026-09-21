from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from backend.database import db
from backend.auth_service import get_current_user, verify_case_access, require_role
from backend.audit_service import audit_service
from backend.health_service import assert_feature_available

router = APIRouter(tags=["Case Management & Evidence Intelligence"])

# Pydantic Request Models with strict validation
class CreateCaseRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    case_type: str = Field("Organized Syndicate", max_length=50)
    priority: str = Field("Medium", pattern="^(Low|Medium|High|Critical)$")
    investigator: str = Field("Special Agent Marcus Vance", max_length=100)
    reference_no: Optional[str] = Field(None, max_length=50)
    date: Optional[str] = None
    tags: Optional[List[str]] = []
    description: Optional[str] = Field("", max_length=2000)

class UpdateCaseRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=150)
    case_type: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=30)
    priority: Optional[str] = Field(None, pattern="^(Low|Medium|High|Critical)$")
    investigator: Optional[str] = Field(None, max_length=100)
    reference_no: Optional[str] = Field(None, max_length=50)
    tags: Optional[List[str]] = None
    description: Optional[str] = Field(None, max_length=2000)
    investigation_status: Optional[str] = Field(None, max_length=50)

class CreateEvidenceRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    type: str = Field("Documents", max_length=50)
    category: Optional[str] = Field("Documents", max_length=50)
    file_size: Optional[str] = Field("1.2 MB", max_length=20)
    mime_type: Optional[str] = Field("application/octet-stream", max_length=50)
    source: Optional[str] = Field("Investigator Direct Ingestion", max_length=100)
    preview_url: Optional[str] = Field("", max_length=500)
    notes: Optional[str] = Field("", max_length=2000)
    entities: Optional[List[Dict[str, Any]]] = []
    relationships: Optional[List[Dict[str, Any]]] = []

# ── Cases Endpoints ─────────────────────────────────────────────────────────────

@router.get("/api/cases")
def list_cases(current_user: dict = Depends(get_current_user)):
    """Retrieve operational investigation cases authorized for this user."""
    all_cases = db.get_cases()
    allowed = current_user.get("allowed_cases", ["*"])
    if "*" in allowed:
        filtered = all_cases
    else:
        filtered = [c for c in all_cases if c.get("id") in allowed]

    return {"cases": filtered, "total": len(filtered)}

@router.post("/api/cases")
def create_case(
    req: CreateCaseRequest,
    current_user: dict = Depends(require_role("INVESTIGATOR", "SUPERVISOR", "ADMIN"))
):
    """Create a new case docket with server-side validation and audit logging."""
    assert_feature_available("CASE_MUTATIONS")

    case_data = {
        "title": req.title.strip(),
        "case_type": req.case_type,
        "priority": req.priority,
        "investigator": req.investigator or current_user.get("full_name"),
        "reference_no": req.reference_no,
        "tags": req.tags or [],
        "description": req.description or "",
    }
    if req.date:
        case_data["created_date"] = req.date

    created = db.create_case(case_data)

    audit_service.log_event(
        action="CASE_CREATE",
        actor=current_user["email"],
        resource=created.get("id", "case"),
        case_id=created.get("id"),
        result="SUCCESS",
        details={"title": req.title.strip(), "priority": req.priority}
    )

    return {"status": "SUCCESS", "case": created}

@router.get("/api/cases/{case_id:path}/evidence")
def get_case_evidence(case_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieve all evidence files associated with a specific case."""
    verify_case_access(case_id, current_user)
    evidence = db.get_evidence(case_id=case_id)
    return {"case_id": case_id, "evidence": evidence, "total": len(evidence)}

@router.post("/api/cases/{case_id:path}/evidence/upload")
def upload_case_evidence_json(
    case_id: str,
    req: CreateEvidenceRequest,
    current_user: dict = Depends(require_role("INVESTIGATOR", "SUPERVISOR", "ADMIN"))
):
    """Upload evidence to a case via JSON payload with server-side validation."""
    verify_case_access(case_id, current_user)
    assert_feature_available("EVIDENCE_MUTATIONS")

    case_obj = db.get_case(case_id)
    if not case_obj:
        raise HTTPException(status_code=404, detail=f"Target case {case_id} not found.")

    evidence_data = {
        "name": req.name.strip(),
        "type": req.type,
        "category": req.category or req.type,
        "case_id": case_id,
        "file_size": req.file_size or "1.2 MB",
        "mime_type": req.mime_type or "application/octet-stream",
        "source": req.source or "Field Investigator Upload",
        "preview_url": req.preview_url or "",
        "notes": req.notes or "",
        "entities": req.entities or [],
        "relationships": req.relationships or [],
        "processing_state": "PROCESSING"
    }

    new_ev = db.add_evidence(evidence_data)
    processed = db.process_evidence(new_ev["id"])

    audit_service.log_event(
        action="EVIDENCE_UPLOAD",
        actor=current_user["email"],
        resource=new_ev.get("id", "evidence"),
        case_id=case_id,
        result="SUCCESS",
        details={"name": req.name.strip(), "type": req.type}
    )

    return {"status": "UPLOADED_AND_PROCESSED", "evidence": processed or new_ev}

@router.get("/api/cases/{case_id:path}")
def get_case_detail(case_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieve deep case workspace context including evidence, entities, relationships, and timeline."""
    verify_case_access(case_id, current_user)
    c = db.get_case(case_id)
    if not c:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found.")

    audit_service.log_event(
        action="CASE_ACCESS",
        actor=current_user["email"],
        resource=f"/cases/{case_id}",
        case_id=case_id,
        result="SUCCESS"
    )

    return c

@router.put("/api/cases/{case_id:path}")
def update_case(
    case_id: str,
    req: UpdateCaseRequest,
    current_user: dict = Depends(require_role("INVESTIGATOR", "SUPERVISOR", "ADMIN"))
):
    """Update case metadata, status, or priority with authorization."""
    verify_case_access(case_id, current_user)
    assert_feature_available("CASE_MUTATIONS")

    updates = req.dict(exclude_unset=True)
    updated = db.update_case(case_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found.")

    audit_service.log_event(
        action="CASE_UPDATE",
        actor=current_user["email"],
        resource=f"/cases/{case_id}",
        case_id=case_id,
        result="SUCCESS",
        details={"updated_fields": list(updates.keys())}
    )

    return {"status": "UPDATED", "case": updated}

# ── Global Evidence Endpoints ───────────────────────────────────────────────────

@router.get("/api/evidence")
def list_evidence(
    case_id: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Global evidence repository with case authorization filtering."""
    if case_id:
        verify_case_access(case_id, current_user)
    items = db.get_evidence(case_id=case_id, category=category, search=search)
    allowed = current_user.get("allowed_cases", ["*"])
    if "*" not in allowed:
        items = [ev for ev in items if ev.get("case_id") in allowed]

    return {"evidence": items, "total": len(items)}

@router.get("/api/evidence/{evidence_id:path}")
def get_evidence_detail(evidence_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieve detailed evidence metadata with case authorization."""
    ev = db.get_evidence_by_id(evidence_id)
    if not ev:
        raise HTTPException(status_code=404, detail=f"Evidence {evidence_id} not found.")
    
    if ev.get("case_id"):
        verify_case_access(ev["case_id"], current_user)

    audit_service.log_event(
        action="EVIDENCE_VIEW",
        actor=current_user["email"],
        resource=f"/evidence/{evidence_id}",
        case_id=ev.get("case_id"),
        result="SUCCESS"
    )

    return ev

@router.post("/api/evidence/{evidence_id:path}/process")
def process_evidence(
    evidence_id: str,
    current_user: dict = Depends(require_role("INVESTIGATOR", "ANALYST", "SUPERVISOR", "ADMIN"))
):
    """Trigger multi-stage NLP & computer vision entity extraction pipeline on an evidence item."""
    ev = db.get_evidence_by_id(evidence_id)
    if not ev:
        raise HTTPException(status_code=404, detail=f"Evidence {evidence_id} not found.")
    
    if ev.get("case_id"):
        verify_case_access(ev["case_id"], current_user)

    processed = db.process_evidence(evidence_id)
    if not processed:
        raise HTTPException(status_code=404, detail=f"Evidence {evidence_id} not found.")

    audit_service.log_event(
        action="EVIDENCE_PROCESS",
        actor=current_user["email"],
        resource=f"/evidence/{evidence_id}",
        case_id=ev.get("case_id"),
        result="SUCCESS"
    )

    return {"status": "ANALYZED", "evidence": processed}

# ── Global Intelligence Search ─────────────────────────────────────────────────

@router.get("/api/search")
def global_search(
    q: str = Query(..., min_length=1, max_length=100),
    current_user: dict = Depends(get_current_user)
):
    """Search across Cases, Evidence items, and Network Graph Entities with strict authorization filtering."""
    raw = db.search_all(q)
    allowed = current_user.get("allowed_cases", ["*"])
    
    if "*" in allowed:
        return raw

    norm_allowed = set(str(c).replace("CASE #", "").strip().upper() for c in allowed)
    
    filtered_cases = [
        c for c in raw.get("cases", [])
        if str(c.get("id", "")).replace("CASE #", "").strip().upper() in norm_allowed
    ]
    
    filtered_evidence = []
    for e in raw.get("evidence", []):
        sub = str(e.get("subtitle", "")).replace("CASE #", "").strip().upper()
        if any(norm_c in sub for norm_c in norm_allowed):
            filtered_evidence.append(e)
            
    filtered_entities = [
        ent for ent in raw.get("entities", [])
        if not ent.get("case_id") or str(ent.get("case_id")).replace("CASE #", "").strip().upper() in norm_allowed
    ]
    
    return {
        "cases": filtered_cases,
        "evidence": filtered_evidence,
        "entities": filtered_entities,
        "total_matches": len(filtered_cases) + len(filtered_evidence) + len(filtered_entities)
    }

