from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from backend.database import db
from backend.auth_service import get_current_user, require_role, verify_case_access
from backend.audit_service import audit_service
from backend.health_service import assert_feature_available

router = APIRouter(prefix="/api/entity-resolution", tags=["Entity Resolution & De-anonymization"])

class MergeEntityRequest(BaseModel):
    case_id: str = Field(..., min_length=1, max_length=100)
    primary_id: str = Field(..., min_length=1, max_length=100)
    alias_name: str = Field(..., min_length=1, max_length=100)
    match_score: float = Field(..., ge=0.0, le=1.0)

@router.get("/cases")
def get_resolution_cases(current_user: dict = Depends(get_current_user)):
    return {
        "cases": db.resolution_cases,
        "total_unresolved": len(db.resolution_cases)
    }

@router.post("/merge")
def merge_resolved_entity(
    request: MergeEntityRequest,
    current_user: dict = Depends(require_role("INVESTIGATOR", "SUPERVISOR", "ADMIN"))
):
    """
    Executes entity deduplication and graph identity unification.
    Requires case access, investigator role, checks degraded mode, and logs to audit.
    """
    verify_case_access(request.case_id, current_user)
    assert_feature_available("GRAPH_MUTATION")

    updated_node = db.merge_entities(request.primary_id, request.alias_name, request.match_score)
    if not updated_node:
        raise HTTPException(status_code=404, detail="Primary entity not found in Knowledge Graph.")

    # Update case status
    for c in db.resolution_cases:
        if c["id"] == request.case_id:
            c["status"] = "RESOLVED_MERGED"
            c["resolved_alias"] = request.alias_name

    audit_service.log_event(
        action="ENTITY_MERGE",
        actor=current_user["email"],
        resource=f"{request.primary_id}<-{request.alias_name}",
        case_id=request.case_id,
        result="SUCCESS",
        details={"primary_id": request.primary_id, "alias": request.alias_name, "score": request.match_score}
    )

    return {
        "success": True,
        "message": f"Successfully unified '{request.alias_name}' into verified identity '{updated_node['data']['label']}'.",
        "updated_node": updated_node,
        "case_id": request.case_id
    }
