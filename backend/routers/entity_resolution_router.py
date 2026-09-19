from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from backend.database import db

router = APIRouter(prefix="/api/entity-resolution", tags=["Entity Resolution & De-anonymization"])

class MergeEntityRequest(BaseModel):
    case_id: str
    primary_id: str
    alias_name: str
    match_score: float

@router.get("/cases")
def get_resolution_cases():
    return {
        "cases": db.resolution_cases,
        "total_unresolved": len(db.resolution_cases)
    }

@router.post("/merge")
def merge_resolved_entity(request: MergeEntityRequest):
    """
    Executes entity deduplication and graph identity unification:
    merges the alias into the target suspect identity, adding resolved attributes to the Knowledge Graph.
    """
    updated_node = db.merge_entities(request.primary_id, request.alias_name, request.match_score)
    if not updated_node:
        raise HTTPException(status_code=404, detail="Primary entity not found in Knowledge Graph.")

    # Update the case status
    for c in db.resolution_cases:
        if c["id"] == request.case_id:
            c["status"] = "RESOLVED_MERGED"
            c["resolved_alias"] = request.alias_name

    return {
        "success": True,
        "message": f"Successfully unified '{request.alias_name}' into verified identity '{updated_node['data']['label']}'.",
        "updated_node": updated_node,
        "case_id": request.case_id
    }
