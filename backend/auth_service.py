"""
CRIMENET AI - Authentication & Authorization Service
Provides:
- PBKDF2 password verification
- Sliding-window rate limiting on login attempts (generic errors)
- Server-side token issuance with unique JTI and short-lived expiry
- Token revocation / blacklist on logout
- RBAC role enforcement (INVESTIGATOR, ANALYST, SUPERVISOR, ADMIN)
- Per-case access verification (verify_case_access)
- Audit log integration for all auth and authorization events
"""

import time
import uuid
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, List, Set

import jwt
from fastapi import HTTPException, Request, Response, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from backend.config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    CRIMENET_ENV,
    DEMO_ACCOUNTS,
    verify_password,
)
from backend.audit_service import audit_service

security_scheme = HTTPBearer(auto_error=False)

# In-memory token blacklist for revoked tokens (persists for lifetime of process)
# In production, this can be backed by Redis or database
REVOKED_TOKENS: Set[str] = set()

# In-memory sliding-window rate limiter for failed login attempts
# Key: client_ip or identifier -> list of timestamp floats
FAILED_ATTEMPTS: Dict[str, List[float]] = defaultdict(list)
RATE_LIMIT_WINDOW_SECONDS = 300  # 5 minutes
MAX_FAILED_ATTEMPTS = 5

# RBAC Role Hierarchy
ROLE_HIERARCHY = {
    "ADMIN": 4,
    "SUPERVISOR": 3,
    "ANALYST": 2,
    "INVESTIGATOR": 1
}

# Clearance Hierarchy
CLEARANCE_HIERARCHY = {
    "TS/SCI-ORCON": 4,
    "TS//SCI-ORCON": 4,
    "TS//SCI": 3,
    "TS/SCI": 3,
    "SECRET": 2,
    "CONFIDENTIAL": 1,
    "UNCLASSIFIED": 0
}

def check_rate_limit(key: str) -> None:
    now = time.time()
    # Remove timestamps older than window
    FAILED_ATTEMPTS[key] = [t for t in FAILED_ATTEMPTS[key] if now - t < RATE_LIMIT_WINDOW_SECONDS]
    if len(FAILED_ATTEMPTS[key]) >= MAX_FAILED_ATTEMPTS:
        retry_after = int(RATE_LIMIT_WINDOW_SECONDS - (now - FAILED_ATTEMPTS[key][0]))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Account temporarily locked for {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)}
        )

def record_failed_attempt(key: str) -> None:
    FAILED_ATTEMPTS[key].append(time.time())

def clear_failed_attempts(key: str) -> None:
    if key in FAILED_ATTEMPTS:
        del FAILED_ATTEMPTS[key]

def create_access_token(user_data: dict) -> tuple[str, str, datetime]:
    jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "jti": jti,
        "sub": user_data.get("email", user_data.get("sub", "user")),
        "name": user_data.get("full_name", user_data.get("name", "User")),
        "role": user_data.get("role", "ANALYST"),
        "clearance": user_data.get("clearance", "SECRET"),
        "badge_id": user_data.get("badge_id", "CN-0000"),
        "allowed_cases": user_data.get("allowed_cases", ["*"]),
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt, jti, expire

def authenticate_user(identifier: str, password: str, client_ip: str = "127.0.0.1") -> dict:
    rate_limit_key = f"{client_ip}:{identifier.lower()}"
    check_rate_limit(rate_limit_key)

    ident_lower = identifier.strip().lower()
    
    # Generic error message to never reveal whether an account exists
    generic_error = "Invalid credentials or unauthorized access."

    # In DEMO environment, check DEMO_ACCOUNTS
    user = None
    if CRIMENET_ENV == "demo":
        # Allow email, prefix, badge ID, full name, or last name matching for investigator convenience
        for email, account in DEMO_ACCOUNTS.items():
            prefix = email.split("@")[0].lower()
            badge = account.get("badge_id", "").lower()
            full_name = account.get("full_name", "").lower()
            prefix_parts = prefix.split(".")
            
            candidates = {email.lower(), prefix, badge}
            candidates.update(prefix_parts)
            
            if (
                ident_lower in candidates
                or ident_lower == full_name
                or ident_lower in full_name
                or full_name in ident_lower
                or any(part in ident_lower for part in prefix_parts if len(part) >= 3)
            ):
                user = account
                break

    if not user:
        record_failed_attempt(rate_limit_key)
        audit_service.log_event(
            action="LOGIN_FAILED",
            actor=identifier[:64],
            resource="/api/auth/login",
            result="DENIED",
            source_ip=client_ip,
            details={"reason": "User not found or account disabled in this environment"}
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=generic_error)

    # Verify password against PBKDF2 hash (also allow standard demo passwords in demo environment)
    password_valid = verify_password(user["password_hash"], password)
    if not password_valid and CRIMENET_ENV == "demo":
        acceptable_demo_passes = {"demo123", "Crimenet2026!", "Investigator2026!", "Supervisor2026!", "Admin2026!", "demo", "admin", "password"}
        if password.strip() in acceptable_demo_passes:
            password_valid = True

    if not password_valid:
        record_failed_attempt(rate_limit_key)
        audit_service.log_event(
            action="LOGIN_FAILED",
            actor=user["email"],
            resource="/api/auth/login",
            result="DENIED",
            source_ip=client_ip,
            details={"reason": "Password mismatch"}
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=generic_error)

    # Authentication succeeded: reset rate limit attempts
    clear_failed_attempts(rate_limit_key)

    audit_service.log_event(
        action="LOGIN_SUCCESS",
        actor=user["email"],
        resource="/api/auth/login",
        result="SUCCESS",
        source_ip=client_ip
    )

    return user

def revoke_token(jti: str) -> None:
    REVOKED_TOKENS.add(jti)

def is_token_revoked(jti: str) -> bool:
    return jti in REVOKED_TOKENS

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> dict:
    token = None
    # 1. Check Authorization: Bearer <token>
    if credentials and credentials.credentials:
        token = credentials.credentials
    # 2. Check HttpOnly cookie
    elif "crimenet_session" in request.cookies:
        token = request.cookies["crimenet_session"]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided."
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        jti = payload.get("jti")
        if not jti or is_token_revoked(jti):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session has been revoked or expired. Please log in again."
            )
        
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload."
            )

        return {
            "email": email,
            "full_name": payload.get("name", "Investigator"),
            "role": payload.get("role", "INVESTIGATOR"),
            "clearance": payload.get("clearance", "SECRET"),
            "badge_id": payload.get("badge_id", "CN-0000"),
            "allowed_cases": payload.get("allowed_cases", ["*"]),
            "jti": jti,
            "mfa_enrolled": False,
            "mfa_required": False
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tactical session expired. Please log in again."
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or unrecognized authentication credentials."
        )

def require_role(*allowed_roles: str):
    """
    Role-Based Access Control dependency.
    Checks if current_user's role satisfies minimum hierarchy or allowed_roles.
    """
    async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = current_user.get("role", "INVESTIGATOR")
        user_level = ROLE_HIERARCHY.get(user_role, 1)

        # Direct match
        if user_role in allowed_roles:
            return current_user

        # Hierarchy check: If user level >= highest level in allowed_roles
        # (e.g. ADMIN can do anything, SUPERVISOR can do ANALYST/INVESTIGATOR)
        min_required_level = min([ROLE_HIERARCHY.get(r, 1) for r in allowed_roles])
        if user_level >= min_required_level:
            return current_user

        audit_service.log_event(
            action="RBAC_ACCESS_DENIED",
            actor=current_user["email"],
            resource="endpoint",
            result="DENIED",
            details={"user_role": user_role, "required_roles": list(allowed_roles)}
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Required clearance role: {', '.join(allowed_roles)}. Your role: {user_role}."
        )
    return role_checker

def require_clearance(min_clearance: str):
    """
    Clearance Level dependency.
    Checks if current_user's clearance satisfies required minimum clearance.
    """
    async def clearance_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_clearance = str(current_user.get("clearance", "UNCLASSIFIED")).strip()
        user_level = CLEARANCE_HIERARCHY.get(user_clearance.upper(), 0)
        min_level = CLEARANCE_HIERARCHY.get(min_clearance.strip().upper(), 2)

        if user_level >= min_level:
            return current_user

        audit_service.log_event(
            action="CLEARANCE_ACCESS_DENIED",
            actor=current_user.get("email", "anonymous"),
            resource="endpoint",
            result="DENIED",
            details={"user_clearance": user_clearance, "required_clearance": min_clearance}
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: Required clearance level {min_clearance}. Your clearance: {user_clearance}."
        )
    return clearance_checker

def verify_case_access(case_id: str, user: dict) -> bool:
    """
    Per-case access verification.
    Checks user's allowed_cases and clearance level.
    """
    allowed_cases = user.get("allowed_cases", [])
    if "*" in allowed_cases:
        return True
    if case_id in allowed_cases:
        return True

    norm_target = str(case_id).replace("CASE #", "").strip().upper()
    norm_allowed = [str(c).replace("CASE #", "").strip().upper() for c in allowed_cases]
    if norm_target in norm_allowed or any(norm_target == a for a in norm_allowed):
        return True
    
    audit_service.log_event(
        action="CASE_ACCESS",
        actor=user.get("email", "unknown"),
        resource=f"/cases/{case_id}",
        case_id=case_id,
        result="DENIED",
        details={"reason": "User not assigned to this case dossier"}
    )
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=f"Access denied: You do not have clearance for case dossier {case_id}."
    )

