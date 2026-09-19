from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from backend.database import db

router = APIRouter(prefix="/api/incidents", tags=["Tactical Incidents & Dispatch"])

class DispatchRequest(BaseModel):
    unit_name: str
    incident_id: str

@router.get("/")
def list_incidents():
    return {
        "incidents": db.incidents,
        "active_count": len(db.incidents),
        "critical_count": len([i for i in db.incidents if i["threatLevel"] == "CRITICAL"])
    }

@router.post("/{incident_id}/dispatch")
def dispatch_unit(incident_id: str, request: Optional[DispatchRequest] = None):
    unit = request.unit_name if request else "Tactical Strike Unit 4"
    for inc in db.incidents:
        if inc["id"] == incident_id:
            inc["status"] = "DISPATCHED"
            if unit not in inc["unitsDispatched"]:
                inc["unitsDispatched"].append(unit)
            return {
                "success": True,
                "incident_id": incident_id,
                "status": "DISPATCHED",
                "unit": unit,
                "incident": inc
            }
    raise HTTPException(status_code=404, detail="Incident not found")
