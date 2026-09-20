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
)
from backend.audit_service import audit_service
from backend.health_service import probe_system_health
from backend.config import CRIMENET_ENV

router = APIRouter(prefix="/api", tags=["Authentication & System Health"])

class LoginRequest(BaseModel):
    user_id: Optional[str] = Field(None, description="Username, Badge ID, or Email")
    email: Optional[str] = Field(None, description="Email address")
    password: str = Field(..., min_length=1, description="Account password")

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]
    system_status: Optional[Dict[str, Any]] = None

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
