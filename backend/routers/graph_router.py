"""
CRIMENET AI - Knowledge Graph & Network Analytics Router
Provides REST endpoints connecting React/Cytoscape with Neo4j.
Features strict case isolation, entity/relationship inspection,
shortest-path discovery, neutral analytics, and controlled neighborhood expansion.
"""

from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from backend.neo4j_service import neo4j_service
from backend.auth_service import get_current_user, verify_case_access
from backend.health_service import assert_feature_available
from backend.audit_service import audit_service

router = APIRouter(tags=["Knowledge Graph & Network Analytics"])

# Pydantic Schemas with strict validation
class PathFindRequest(BaseModel):
    source_id: str = Field(..., min_length=1, max_length=100)
    target_id: str = Field(..., min_length=1, max_length=100)
    max_hops: Optional[int] = Field(5, ge=1, le=10)

class ExpandNodeRequest(BaseModel):
    entity_id: str = Field(..., min_length=1, max_length=100)

# =============================================================================
# 1. Neo4j System Status & Telemetry
# =============================================================================
@router.get("/api/graph/status")
def get_graph_status(current_user: dict = Depends(get_current_user)):
    """
    Returns live connectivity telemetry for the Neo4j graph database.
    Truthfully reports CACHED or OFFLINE when live Neo4j is unavailable.
    """
    return neo4j_service.get_status()

# =============================================================================
# 2. Case-Isolated Network Graph Endpoints
# =============================================================================
@router.get("/api/cases/{case_id:path}/graph/analytics")
def get_case_network_analytics(case_id: str, current_user: dict = Depends(get_current_user)):
    """
    Calculates analytical metrics for the specified case graph.
    """
    verify_case_access(case_id, current_user)
    return neo4j_service.get_case_analytics(case_id)

@router.post("/api/cases/{case_id:path}/graph/path")
def find_case_connection_path(
    case_id: str,
    req: PathFindRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Finds the shortest relational trail between two entities strictly scoped to the active case.
    """
    verify_case_access(case_id, current_user)
    return neo4j_service.find_path(
        case_id=case_id,
        source_id=req.source_id,
        target_id=req.target_id,
        max_hops=req.max_hops or 5
    )

@router.post("/api/cases/{case_id:path}/graph/expand")
def expand_case_entity(
    case_id: str,
    req: ExpandNodeRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Discovers 1-hop neighborhood entities connected to the specified node within the case docket.
    """
    verify_case_access(case_id, current_user)
    return neo4j_service.expand_entity(case_id=case_id, entity_id=req.entity_id)

@router.get("/api/cases/{case_id:path}/entities")
def get_case_entities(case_id: str, current_user: dict = Depends(get_current_user)):
    """
    Returns all entities discovered or ingested for this case.
    """
    verify_case_access(case_id, current_user)
    graph = neo4j_service.get_case_graph(case_id)
    return {
        "case_id": case_id,
        "entities": [n["data"] for n in graph.get("nodes", [])],
        "total": len(graph.get("nodes", []))
    }

@router.get("/api/cases/{case_id:path}/relationships")
def get_case_relationships(case_id: str, current_user: dict = Depends(get_current_user)):
    """
    Returns all relational links between entities for this case.
    """
    verify_case_access(case_id, current_user)
    graph = neo4j_service.get_case_graph(case_id)
    return {
        "case_id": case_id,
        "relationships": [e["data"] for e in graph.get("edges", [])],
        "total": len(graph.get("edges", []))
    }

@router.get("/api/cases/{case_id:path}/graph")
def get_case_graph(
    case_id: str,
    threat_filter: Optional[str] = Query(None, description="Filter: ALL, CRITICAL, HIGH, MEDIUM"),
    type_filter: Optional[str] = Query(None, description="Filter by entity type (Person, Phone, Vehicle, etc.)"),
    relation_filter: Optional[str] = Query(None, description="Filter by relation type (calls, financial, etc.)"),
    current_user: dict = Depends(get_current_user)
):
    """
    Primary graph retrieval endpoint: returns case-isolated nodes and edges formatted for Cytoscape.js.
    """
    verify_case_access(case_id, current_user)
    return neo4j_service.get_case_graph(
        case_id=case_id,
        threat_filter=threat_filter,
        type_filter=type_filter,
        relation_filter=relation_filter
    )

# =============================================================================
# 3. Node & Edge Detail Inspection
# =============================================================================
@router.get("/api/entities/{entity_id}")
def get_entity_detail(
    entity_id: str,
    case_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Deep property inspection of a specific entity, its connections, and supporting evidence.
    """
    if case_id:
        verify_case_access(case_id, current_user)
    detail = neo4j_service.get_entity_details(entity_id, case_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Entity {entity_id} not found.")
    return detail

@router.get("/api/relationships/{relationship_id}")
@router.get("/api/graph/edge/{relationship_id}")
def get_relationship_detail(
    relationship_id: str,
    case_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Deep inspection of a relationship, its confidence score, and supporting evidence file.
    """
    if case_id:
        verify_case_access(case_id, current_user)
    detail = neo4j_service.get_relationship_details(relationship_id, case_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Relationship {relationship_id} not found.")
    return detail

# =============================================================================
# 4. Backward Compatibility & Global Graph Proxies
# =============================================================================
@router.get("/api/graph/data")
def legacy_get_graph_data(
    case_id: Optional[str] = Query(None),
    threat_filter: Optional[str] = Query(None),
    type_filter: Optional[str] = Query(None),
    relation_filter: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Legacy backwards compatibility endpoint supporting both global and case-specific queries.
    """
    target_case = case_id if case_id and case_id.upper() != "ALL" else "CR-204"
    verify_case_access(target_case, current_user)
    return neo4j_service.get_case_graph(
        case_id=target_case,
        threat_filter=threat_filter,
        type_filter=type_filter,
        relation_filter=relation_filter
    )

@router.get("/api/graph/shortest-path")
def legacy_shortest_path(
    source_id: str,
    target_id: str,
    case_id: Optional[str] = Query("CR-204"),
    current_user: dict = Depends(get_current_user)
):
    target = case_id or "CR-204"
    verify_case_access(target, current_user)
    return neo4j_service.find_path(target, source_id, target_id)

@router.get("/api/graph/analytics")
def legacy_graph_analytics(
    case_id: Optional[str] = Query("CR-204"),
    current_user: dict = Depends(get_current_user)
):
    target = case_id or "CR-204"
    verify_case_access(target, current_user)
    return neo4j_service.get_case_analytics(target)

@router.post("/api/graph/expand-node/{node_id}")
def legacy_expand_node(
    node_id: str,
    case_id: Optional[str] = Query("CR-204"),
    current_user: dict = Depends(get_current_user)
):
    target = case_id or "CR-204"
    verify_case_access(target, current_user)
    return neo4j_service.expand_entity(target, node_id)
