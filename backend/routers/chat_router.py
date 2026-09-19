"""
CRIMENET AI — CIRA AI Investigation Assistant Router (Phase 4)
Provides case-isolated conversation management, tool-backed investigation copilot endpoints,
and integration with Neo4j and Case Intelligence repositories.
"""

from fastapi import APIRouter, HTTPException, Header, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

from backend.cira_service import cira_service
from backend.database import db

router = APIRouter(tags=["CIRA AI Investigation Assistant"])

# =============================================================================
# Request & Response Schemas
# =============================================================================
class CIRAChatRequest(BaseModel):
    message: str
    case_id: Optional[str] = "CASE #CR-2026-0142"
    conversation_id: Optional[str] = None
    active_entity_id: Optional[str] = None
    ai_provider: Optional[str] = None  # "openai", "claude", "gemini", "groq", "openrouter", "ollama", "builtin"
    api_key: Optional[str] = None
    model_name: Optional[str] = None
    base_url: Optional[str] = None


class CIRAConfigRequest(BaseModel):
    provider: Optional[str] = "builtin"
    model: Optional[str] = "gpt-4o"
    api_key: Optional[str] = ""
    base_url: Optional[str] = ""


class CIRATestConnectionRequest(BaseModel):
    provider: str
    model: Optional[str] = None
    api_key: Optional[str] = None
    base_url: Optional[str] = None


class CreateConversationRequest(BaseModel):
    title: Optional[str] = None


class RenameConversationRequest(BaseModel):
    title: str


# Legacy compatibility schema
class LegacyChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None


class LegacyChatRequest(BaseModel):
    messages: List[LegacyChatMessage]
    active_case_id: Optional[str] = "CASE #CR-2026-0142"
    gemini_api_key: Optional[str] = None


# =============================================================================
# 1. Main CIRA Chat Endpoint (Both Case-Scoped and Global)
# =============================================================================
@router.post("/api/cases/{case_id:path}/cira/chat")
def cira_case_chat(case_id: str, req: CIRAChatRequest):
    """
    Primary Phase 4 CIRA Chat Endpoint:
    Processes investigator queries strictly scoped to the active case_id.
    Executes backend investigation tools against Neo4j and Case DB.
    Returns structured markdown, source citations, linked entities, and follow-ups.
    """
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Query message cannot be empty.")

    try:
        res = cira_service.process_chat(
            case_id=case_id,
            message=req.message.strip(),
            conversation_id=req.conversation_id,
            active_entity_id=req.active_entity_id,
            ai_provider=req.ai_provider,
            api_key=req.api_key,
            model_name=req.model_name,
            base_url=req.base_url
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CIRA processing error: {str(e)}")


@router.post("/api/cira/chat")
def cira_general_chat(req: CIRAChatRequest):
    """Direct CIRA Chat endpoint defaulting to active or specified case."""
    effective_case = req.case_id or "CASE #CR-2026-0142"
    return cira_case_chat(case_id=effective_case, req=req)


# =============================================================================
# 2. Case-Isolated Conversation Management
# =============================================================================
@router.get("/api/cases/{case_id:path}/cira/conversations")
def get_case_conversations(case_id: str):
    """Retrieves all conversation sessions associated with the active case."""
    norm_case_id = db.normalize_case_id(case_id)
    convs = db.get_conversations(norm_case_id)
    return {
        "case_id": norm_case_id,
        "conversations": convs,
        "total": len(convs)
    }


@router.post("/api/cases/{case_id:path}/cira/conversations")
def create_case_conversation(case_id: str, req: CreateConversationRequest):
    """Creates a new conversation thread strictly scoped to this case docket."""
    norm_case_id = db.normalize_case_id(case_id)
    new_conv = db.create_conversation(case_id=norm_case_id, title=req.title)
    return new_conv


@router.get("/api/cases/{case_id:path}/cira/conversations/{conversation_id}")
def get_conversation_detail(case_id: str, conversation_id: str):
    """Retrieves the full message history and metadata for a conversation."""
    norm_case_id = db.normalize_case_id(case_id)
    conv = db.get_conversation(case_id=norm_case_id, conversation_id=conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation session not found in docket.")
    return conv


@router.patch("/api/cases/{case_id:path}/cira/conversations/{conversation_id}")
def rename_conversation(case_id: str, conversation_id: str, req: RenameConversationRequest):
    """Renames an existing conversation thread."""
    norm_case_id = db.normalize_case_id(case_id)
    updated = db.rename_conversation(case_id=norm_case_id, conversation_id=conversation_id, new_title=req.title)
    if not updated:
        raise HTTPException(status_code=404, detail="Conversation session not found.")
    return updated


@router.delete("/api/cases/{case_id:path}/cira/conversations/{conversation_id}")
def delete_conversation(case_id: str, conversation_id: str):
    """Deletes a conversation session from the case docket."""
    norm_case_id = db.normalize_case_id(case_id)
    success = db.delete_conversation(case_id=norm_case_id, conversation_id=conversation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation session not found.")
    return {"status": "DELETED", "conversation_id": conversation_id, "case_id": norm_case_id}


# =============================================================================
# 3. Live Case Context Telemetry for Copilot HUD
# =============================================================================
@router.get("/api/cases/{case_id:path}/cira/context")
def get_cira_case_context(case_id: str):
    """
    Returns real-time telemetry metrics for the CIRA Right Panel:
    Total evidence, entities, relationships, density, and key targets.
    """
    norm_case_id = db.normalize_case_id(case_id)
    summary = cira_service.tools.get_case_summary(norm_case_id)
    return {
        "case_id": norm_case_id,
        "title": summary.get("title"),
        "priority": summary.get("priority"),
        "status": summary.get("status"),
        "evidence_count": summary.get("evidence_count", 0),
        "entity_count": summary.get("entity_count", 0),
        "relationship_count": summary.get("relationship_count", 0),
        "density": summary.get("density", 0.0),
        "most_connected": summary.get("most_connected", []),
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    }


# =============================================================================
# 4. Engine Health, Configuration & Testing
# =============================================================================
@router.get("/api/cira/status")
def get_cira_engine_status():
    """Returns AI model and inference engine health."""
    return cira_service.get_status()


@router.get("/api/cira/config")
def get_cira_configuration():
    """Retrieves the active AI provider, model, and endpoint settings."""
    cfg = db.get_ai_config()
    # Mask API key for security
    raw_key = cfg.get("api_key", "")
    masked = f"...{raw_key[-4:]}" if len(raw_key) > 4 else ("***" if raw_key else "")
    return {
        "provider": cfg.get("provider", "builtin"),
        "model": cfg.get("model", "gpt-4o"),
        "has_api_key": bool(raw_key),
        "masked_key": masked,
        "base_url": cfg.get("base_url", "")
    }


@router.post("/api/cira/config")
def set_cira_configuration(req: CIRAConfigRequest):
    """Updates runtime AI provider settings."""
    updated = db.set_ai_config({
        "provider": req.provider,
        "model": req.model,
        "api_key": req.api_key,
        "base_url": req.base_url
    })
    return {
        "success": True,
        "provider": updated.get("provider"),
        "model": updated.get("model"),
        "has_api_key": bool(updated.get("api_key")),
        "base_url": updated.get("base_url")
    }


@router.post("/api/cira/test-connection")
def test_cira_connection(req: CIRATestConnectionRequest):
    """Verifies authentication and response from chosen AI provider."""
    # Resolve API key if omitted from request
    key_to_test = req.api_key
    if not key_to_test:
        cfg = db.get_ai_config()
        key_to_test = cfg.get("api_key", "")
        
    res = cira_service.universal_ai.test_connection(
        provider=req.provider,
        model=req.model or "",
        api_key=key_to_test or "",
        base_url=req.base_url or ""
    )
    return res


# =============================================================================
# 5. Backward Compatibility Route for Legacy Frontend Callers
# =============================================================================
@router.post("/api/chat/query")
def legacy_chat_query(req: LegacyChatRequest):
    """Preserves compatibility with legacy callers by delegating to CIRA service."""
    if not req.messages:
        return {
            "role": "assistant",
            "content": "Hello Agent. CIRA is synchronized and active. What would you like to investigate?",
            "timestamp": datetime.utcnow().strftime("%H:%M:%S UTC"),
            "followups": [
                {"label": "Case Summary", "command": "Summarize this case"},
                {"label": "Most Connected", "command": "Show the most connected entities"}
            ]
        }
    
    user_msg = req.messages[-1].content
    case_id = req.active_case_id or "CASE #CR-2026-0142"
    
    res = cira_service.process_chat(
        case_id=case_id,
        message=user_msg
    )
    
    return {
        "role": "assistant",
        "content": res["message"],
        "timestamp": res["timestamp"],
        "sources": res.get("sources", []),
        "entities": res.get("entities", []),
        "relationships": res.get("relationships", []),
        "followups": res.get("followups", []),
        "case_id": case_id
    }


@router.get("/api/chat/status")
def legacy_chat_status():
    """Preserves compatibility for status checks."""
    stat = cira_service.get_status()
    return {
        "cira": "online",
        "api_key_configured": stat.get("api_key_configured", False),
        "mode": stat.get("mode"),
        "status": "OPERATIONAL"
    }
