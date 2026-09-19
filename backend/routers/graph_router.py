"""
CRIMENET AI - Knowledge Graph & Network Analytics Router
Provides REST endpoints connecting React/Cytoscape with Neo4j.
Features strict case isolation, entity/relationship inspection,
shortest-path discovery, neutral analytics, and controlled neighborhood expansion.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from backend.neo4j_service import neo4j_service

router = APIRouter(tags=["Knowledge Graph & Network Analytics"])

# Pydantic Schemas
class PathFindRequest(BaseModel):
    source_id: str
    target_id: str
    max_hops: Optional[int] = 5

class ExpandNodeRequest(BaseModel):
    entity_id: str

# =============================================================================
# 1. Neo4j System Status & Telemetry
# =============================================================================
@router.get("/api/graph/status")
def get_graph_status():
    """
    Returns live connectivity telemetry for the Neo4j graph database.
    """
    return neo4j_service.get_status()

# =============================================================================
# 2. Case-Isolated Network Graph Endpoints
# =============================================================================
@router.get("/api/cases/{case_id:path}/graph/analytics")
def get_case_network_analytics(case_id: str):
    """
    Calculates analytical metrics for the specified case graph:
    - Entity breakdown by category
    - Total relationships
    - Most connected entities (neutral, unbiased terminology)
    - Graph density
    """
    return neo4j_service.get_case_analytics(case_id)

@router.post("/api/cases/{case_id:path}/graph/path")
def find_case_connection_path(case_id: str, req: PathFindRequest):
    """
    Finds the shortest relational trail between two entities strictly scoped to the active case.
    """
    if not req.source_id or not req.target_id:
        raise HTTPException(status_code=400, detail="Both source_id and target_id are required.")
    
    return neo4j_service.find_path(
        case_id=case_id,
        source_id=req.source_id,
        target_id=req.target_id,
        max_hops=req.max_hops or 5
    )

@router.post("/api/cases/{case_id:path}/graph/expand")
def expand_case_entity(case_id: str, req: ExpandNodeRequest):
    """
    Discovers 1-hop neighborhood entities connected to the specified node within the case docket.
    """
    if not req.entity_id:
        raise HTTPException(status_code=400, detail="entity_id is required.")
    
    return neo4j_service.expand_entity(case_id=case_id, entity_id=req.entity_id)

@router.get("/api/cases/{case_id:path}/entities")
def get_case_entities(case_id: str):
    """
    Returns all entities discovered or ingested for this case.
    """
    graph = neo4j_service.get_case_graph(case_id)
    return {
        "case_id": case_id,
        "entities": [n["data"] for n in graph.get("nodes", [])],
        "total": len(graph.get("nodes", []))
    }

@router.get("/api/cases/{case_id:path}/relationships")
def get_case_relationships(case_id: str):
    """
    Returns all relational links between entities for this case.
    """
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
    relation_filter: Optional[str] = Query(None, description="Filter by relation type (calls, financial, etc.)")
):
    """
    Primary graph retrieval endpoint: returns case-isolated nodes and edges formatted for Cytoscape.js.
    """
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
def get_entity_detail(entity_id: str, case_id: Optional[str] = Query(None)):
    """
    Deep property inspection of a specific entity, its connections, and supporting evidence.
    """
    detail = neo4j_service.get_entity_details(entity_id, case_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Entity {entity_id} not found.")
    return detail

@router.get("/api/relationships/{relationship_id}")
@router.get("/api/graph/edge/{relationship_id}")
def get_relationship_detail(relationship_id: str, case_id: Optional[str] = Query(None)):
    """
    Deep inspection of a relationship, its confidence score, and supporting evidence file.
    """
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
    relation_filter: Optional[str] = Query(None)
):
    """
    Legacy backwards compatibility endpoint supporting both global and case-specific queries.
    """
    target_case = case_id if case_id and case_id.upper() != "ALL" else "CASE #CR-2026-0142"
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
    case_id: Optional[str] = Query("CASE #CR-2026-0142")
):
    return neo4j_service.find_path(case_id or "CASE #CR-2026-0142", source_id, target_id)

@router.get("/api/graph/analytics")
def legacy_graph_analytics(case_id: Optional[str] = Query("CASE #CR-2026-0142")):
    return neo4j_service.get_case_analytics(case_id or "CASE #CR-2026-0142")

@router.post("/api/graph/expand-node/{node_id}")
def legacy_expand_node(node_id: str, case_id: Optional[str] = Query("CASE #CR-2026-0142")):
    return neo4j_service.expand_entity(case_id or "CASE #CR-2026-0142", node_id)
