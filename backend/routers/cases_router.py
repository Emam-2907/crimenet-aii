from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from backend.database import db

router = APIRouter(tags=["Case Management & Evidence Intelligence"])

# Pydantic Request Models
class CreateCaseRequest(BaseModel):
    title: str
    case_type: str = "Organized Syndicate"
    priority: str = "Medium"
    investigator: str = "Special Agent Marcus Vance"
    reference_no: Optional[str] = None
    date: Optional[str] = None
    tags: Optional[List[str]] = []
    description: Optional[str] = ""

class UpdateCaseRequest(BaseModel):
    title: Optional[str] = None
    case_type: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    investigator: Optional[str] = None
    reference_no: Optional[str] = None
    tags: Optional[List[str]] = None
    description: Optional[str] = None
    investigation_status: Optional[str] = None

class CreateEvidenceRequest(BaseModel):
    name: str
    type: str = "Documents"
    category: Optional[str] = "Documents"
    file_size: Optional[str] = "1.2 MB"
    mime_type: Optional[str] = "application/octet-stream"
    source: Optional[str] = "Investigator Direct Ingestion"
    preview_url: Optional[str] = ""
    notes: Optional[str] = ""
    entities: Optional[List[Dict[str, Any]]] = []
    relationships: Optional[List[Dict[str, Any]]] = []

# ── Cases Endpoints ─────────────────────────────────────────────────────────────

@router.get("/api/cases")
def list_cases():
    """Retrieve all operational investigation cases."""
    return {"cases": db.get_cases(), "total": len(db.get_cases())}

@router.post("/api/cases")
def create_case(req: CreateCaseRequest):
    """Create a new case docket with validation."""
    if not req.title.strip():
        raise HTTPException(status_code=400, detail="Case title is required.")

    case_data = {
        "title": req.title.strip(),
        "case_type": req.case_type,
        "priority": req.priority,
        "investigator": req.investigator,
        "reference_no": req.reference_no,
        "tags": req.tags or [],
        "description": req.description or "",
    }
    if req.date:
        case_data["created_date"] = req.date

    created = db.create_case(case_data)
    return {"status": "SUCCESS", "case": created}

@router.get("/api/cases/{case_id:path}/evidence")
def get_case_evidence(case_id: str):
    """Retrieve all evidence files associated with a specific case."""
    evidence = db.get_evidence(case_id=case_id)
    return {"case_id": case_id, "evidence": evidence, "total": len(evidence)}

@router.post("/api/cases/{case_id:path}/evidence/upload")
def upload_case_evidence_json(case_id: str, req: CreateEvidenceRequest):
    """Upload evidence to a case via JSON payload with instant entity processing."""
    case_obj = db.get_case(case_id)
    if not case_obj:
        raise HTTPException(status_code=404, detail=f"Target case {case_id} not found.")

    evidence_data = {
        "name": req.name,
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
    return {"status": "UPLOADED_AND_PROCESSED", "evidence": processed or new_ev}

@router.get("/api/cases/{case_id:path}")
def get_case_detail(case_id: str):
    """Retrieve deep case workspace context including evidence, entities, relationships, and timeline."""
    c = db.get_case(case_id)
    if not c:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found.")
    return c

@router.put("/api/cases/{case_id:path}")
def update_case(case_id: str, req: UpdateCaseRequest):
    """Update case metadata, status, or priority."""
    updates = req.dict(exclude_unset=True)
    updated = db.update_case(case_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found.")
    return {"status": "UPDATED", "case": updated}

# ── Global Evidence Endpoints ───────────────────────────────────────────────────

@router.get("/api/evidence")
def list_evidence(
    case_id: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None
):
    """Global evidence repository with filtering and search."""
    items = db.get_evidence(case_id=case_id, category=category, search=search)
    return {"evidence": items, "total": len(items)}

@router.get("/api/evidence/{evidence_id:path}")
def get_evidence_detail(evidence_id: str):
    """Retrieve detailed evidence metadata, extracted entities, and case linkages."""
    ev = db.get_evidence_by_id(evidence_id)
    if not ev:
        raise HTTPException(status_code=404, detail=f"Evidence {evidence_id} not found.")
    return ev

@router.post("/api/evidence/{evidence_id:path}/process")
def process_evidence(evidence_id: str):
    """Trigger multi-stage NLP & computer vision entity extraction pipeline on an evidence item."""
    processed = db.process_evidence(evidence_id)
    if not processed:
        raise HTTPException(status_code=404, detail=f"Evidence {evidence_id} not found.")
    return {"status": "ANALYZED", "evidence": processed}

# ── Global Intelligence Search ─────────────────────────────────────────────────

@router.get("/api/search")
def global_search(q: str = Query(..., min_length=1)):
    """Search across Cases, Evidence items, and Network Graph Entities."""
    return db.search_all(q)
