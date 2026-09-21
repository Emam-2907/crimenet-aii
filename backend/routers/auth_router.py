"""
CRIMENET AI - Authentication, Authorization & Health Router
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Request, Response, status
from pydantic import BaseModel, Field

from backend.auth_service import (
    authenticate_user,
    create_access_token,
    revoke_token,
    get_current_user,
    require_role,
    require_clearance,
)
from backend.audit_service import audit_service
from backend.health_service import probe_system_health
from backend.config import CRIMENET_ENV, get_demo_profiles

router = APIRouter(prefix="/api", tags=["Authentication & System Health"])

class LoginRequest(BaseModel):
    user_id: Optional[str] = Field(None, description="Username, Badge ID, or Email")
    email: Optional[str] = Field(None, description="Email address")
    password: str = Field(..., min_length=1, description="Account password")

class DemoLoginRequest(BaseModel):
    email: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]
    system_status: Optional[Dict[str, Any]] = None

class SettingsUpdateRequest(BaseModel):
    gemini_api_key: Optional[str] = Field(None, max_length=200)

@router.get("/auth/demo-profiles")
async def get_demo_accounts_list():
    """Returns safe demo accounts list for login screen in demo mode."""
    return {"profiles": get_demo_profiles(), "environment": CRIMENET_ENV}

@router.post("/auth/demo-login", response_model=TokenResponse)
async def demo_login(req: DemoLoginRequest, request: Request, response: Response):
    """Permits seamless switching between demo personas in demo environment."""
    if CRIMENET_ENV != "demo":
        raise HTTPException(status_code=403, detail="Demo login disabled in this environment.")
    
    email_clean = req.email.strip().lower()
    from backend.config import DEMO_ACCOUNTS
    user = None
    for em, acc in DEMO_ACCOUNTS.items():
        prefix = em.split("@")[0].lower()
        badge = acc.get("badge_id", "").lower()
        full_name = acc.get("full_name", "").lower()
        prefix_parts = prefix.split(".")
        candidates = {em.lower(), prefix, badge}
        candidates.update(prefix_parts)
        
        if (
            email_clean in candidates
            or email_clean == full_name
            or email_clean in full_name
            or any(part in email_clean for part in prefix_parts if len(part) >= 3)
        ):
            user = acc
            break
            
    if not user:
        raise HTTPException(status_code=404, detail="Demo persona not found.")
        
    token, jti, expire = create_access_token(user)
    is_secure = CRIMENET_ENV == "production" or request.url.scheme == "https"
    response.set_cookie(
        key="crimenet_session",
        value=token,
        httponly=True,
        secure=is_secure,
        samesite="lax",
        expires=int(expire.timestamp())
    )
    health = probe_system_health()
    user_profile = {
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "clearance": user.get("clearance", "SECRET"),
        "badge_id": user.get("badge_id", "CN-0000"),
        "station": user.get("station", "Metro Tactical Operations Command"),
        "allowed_cases": user.get("allowed_cases", ["*"]),
        "mfa_enrolled": False,
        "mfa_required": False
    }
    audit_service.log_event(
        action="DEMO_LOGIN_SUCCESS",
        actor=user["email"],
        resource="/api/auth/demo-login",
        result="SUCCESS",
        source_ip="127.0.0.1"
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_profile,
        "system_status": health
    }

@router.post("/auth/login", response_model=TokenResponse)
async def login(request_data: LoginRequest, request: Request, response: Response):
    identifier = (request_data.user_id or request_data.email or "").strip()
    password = request_data.password.strip()

    if not identifier or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User identifier and password are required."
        )

    # Client IP resolution (supporting X-Forwarded-For if behind proxy)
    forwarded = request.headers.get("x-forwarded-for")
    client_ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "127.0.0.1")

    # Authenticate user (server-side PBKDF2 verification, rate limiting, generic errors)
    user = authenticate_user(identifier, password, client_ip=client_ip)

    # Issue short-lived token with unique JTI
    token, jti, expire = create_access_token(user)

    # Set HttpOnly, Secure, SameSite session cookie
    # Secure=True in production, False only for plain HTTP localhost dev
    is_secure = CRIMENET_ENV == "production" or request.url.scheme == "https"
    response.set_cookie(
        key="crimenet_session",
        value=token,
        httponly=True,
        secure=is_secure,
        samesite="lax",
        expires=int(expire.timestamp())
    )

    # Probe truthful system health
    health = probe_system_health()

    # User profile payload (scrub password hashes)
    user_profile = {
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "clearance": user.get("clearance", "SECRET"),
        "badge_id": user.get("badge_id", "CN-0000"),
        "station": user.get("station", "Metro Tactical Operations Command"),
        "allowed_cases": user.get("allowed_cases", ["*"]),
        "mfa_enrolled": False,
        "mfa_required": False
    }

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_profile,
        "system_status": health
    }

@router.post("/auth/logout")
async def logout(
    request: Request,
    response: Response,
    current_user: dict = Depends(get_current_user)
):
    # Revoke current token via JTI
    jti = current_user.get("jti")
    if jti:
        revoke_token(jti)

    # Delete session cookie
    response.delete_cookie("crimenet_session")

    # Log to audit service
    audit_service.log_event(
        action="LOGOUT",
        actor=current_user["email"],
        resource="/api/auth/logout",
        result="SUCCESS"
    )

    return {"message": "Session invalidated successfully.", "status": "LOGGED_OUT"}

@router.get("/auth/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user

@router.get("/health")
@router.get("/system/connectivity")
async def get_health():
    """
    Truthful system health probe.
    Never returns LIVE for unverified or offline components.
    """
    return probe_system_health()

@router.get("/audit/logs")
async def get_audit_logs(
    case_id: Optional[str] = None,
    actor: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = 100,
    current_user: dict = Depends(require_role("SUPERVISOR", "ADMIN"))
):
    """
    Query audit logs. Restricted to SUPERVISOR and ADMIN.
    """
    return audit_service.get_logs(case_id=case_id, actor=actor, action=action, limit=limit)

@router.get("/settings")
@router.get("/system/settings")
async def get_system_settings(
    current_user: dict = Depends(require_role("SUPERVISOR", "ADMIN"))
):
    """
    System and security telemetry.
    Strictly denied to INVESTIGATOR / lower-clearance users (e.g. Detective Chen returns 403).
    """
    health = probe_system_health()
    return {
        "environment": CRIMENET_ENV,
        "clearance_standard": "TS/SCI-ORCON",
        "jurisdictional_authority": "Federal Inter-Agency Counter-Syndicate Taskforce",
        "access_level": current_user.get("clearance", "SECRET"),
        "role": current_user.get("role", "SUPERVISOR"),
        "telemetry": {
            "api_status": health["services"]["api"]["status"],
            "api_version": health["services"]["api"]["version"],
            "database_status": health["services"]["database"]["status"],
            "graph_status": health["services"]["graph"]["status"]
        }
    }

@router.post("/settings")
@router.post("/system/settings")
async def update_system_settings(
    req: SettingsUpdateRequest,
    current_user: dict = Depends(require_role("ADMIN"))
):
    """
    Updates system settings. Restricted to ADMIN.
    """
    if req.gemini_api_key is not None:
        from backend.database import db
        db.set_ai_config({"api_key": req.gemini_api_key})
        audit_service.log_event(
            action="SETTINGS_UPDATE",
            actor=current_user["email"],
            resource="/api/settings",
            result="SUCCESS",
            details={"updated": "api_key"}
        )
    return {"status": "SUCCESS", "message": "Settings updated successfully."}

