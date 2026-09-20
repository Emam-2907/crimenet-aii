from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import List, Optional
from backend.database import db
from backend.auth_service import get_current_user, require_role
from backend.audit_service import audit_service

router = APIRouter(prefix="/api/incidents", tags=["Tactical Incidents & Dispatch"])

class DispatchRequest(BaseModel):
    unit_name: str = Field(..., min_length=2, max_length=100)
    incident_id: str = Field(..., min_length=1, max_length=100)

@router.get("/")
def list_incidents(current_user: dict = Depends(get_current_user)):
    return {
        "incidents": db.incidents,
        "active_count": len(db.incidents),
        "critical_count": len([i for i in db.incidents if i.get("threatLevel") == "CRITICAL"])
    }

@router.post("/{incident_id}/dispatch")
def dispatch_unit(
    incident_id: str,
    request: Optional[DispatchRequest] = None,
    current_user: dict = Depends(require_role("SUPERVISOR", "ADMIN"))
):
    """
    Dispatches tactical unit to an incident.
    Restricted to SUPERVISOR and ADMIN roles.
    Logs dispatch decision to audit log.
    """
    unit = request.unit_name if request else "Tactical Strike Unit 4"
    for inc in db.incidents:
        if inc["id"] == incident_id:
            inc["status"] = "DISPATCHED"
            if unit not in inc.get("unitsDispatched", []):
                inc.setdefault("unitsDispatched", []).append(unit)

            audit_service.log_event(
                action="UNIT_DISPATCH",
                actor=current_user["email"],
                resource=f"/incidents/{incident_id}",
                result="SUCCESS",
                details={"unit": unit, "incident_title": inc.get("title")}
            )

            return {
                "success": True,
                "incident_id": incident_id,
                "status": "DISPATCHED",
                "unit": unit,
                "incident": inc
            }
    raise HTTPException(status_code=404, detail="Incident not found")
