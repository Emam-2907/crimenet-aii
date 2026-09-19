from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta, timezone
from backend.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, DEMO_USER

from typing import Optional
from backend.neo4j_service import neo4j_service
from backend.database import db, CANDIDATE_GALLERY

router = APIRouter(prefix="/api", tags=["Authentication & System Connectivity"])
security = HTTPBearer()

class LoginRequest(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict
    system_status: Optional[dict] = None

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return {
            "email": email,
            "full_name": payload.get("name", "Investigator"),
            "role": payload.get("role", "Field Agent"),
            "clearance": payload.get("clearance", "SECRET"),
            "badge_id": payload.get("badge_id", "CN-0000")
        }
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired tactical credentials")

@router.post("/auth/login", response_model=TokenResponse)
def login(request: LoginRequest):
    ident = (request.user_id or request.email or "").strip()
    pwd = (request.password or "").strip()

    if not ident or not pwd:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID and Password are required."
        )

    ident_lower = ident.lower()

    # Map user id / email to database credentials
    if ident_lower in ["agent.vance@crimenet.gov", "agent.vance", "vance", "marcus", "marcus vance", "demo"]:
        user_info = dict(DEMO_USER)
    elif ident_lower in ["admin", "root", "administrator"]:
        user_info = {
            "email": "admin@crimenet.gov",
            "full_name": "Command Administrator",
            "role": "Chief Information Security Officer",
            "clearance": "TS//SCI-ORCON",
            "badge_id": "CN-HQ-0001",
            "station": "Joint Intelligence Headquarters"
        }
    elif ident_lower in ["elena", "rostova", "elena.rostova@crimenet.gov"]:
        user_info = {
            "email": "elena.rostova@crimenet.gov",
            "full_name": "Dr. Elena Rostova",
            "role": "Senior Biometric & Forensic Analyst",
            "clearance": "SECRET//NOFORN",
            "badge_id": "CN-BIO-4822",
            "station": "Forensic Biometrics & Sensor Lab"
        }
    elif ident_lower in ["wright", "thomas", "thomas.wright@crimenet.gov"]:
        user_info = {
            "email": "thomas.wright@crimenet.gov",
            "full_name": "Inspector Thomas Wright",
            "role": "Financial Crimes & Asset Seizure Lead",
            "clearance": "SECRET",
            "badge_id": "CN-FIN-7719",
            "station": "Illicit Finance & Blockchain Fusion Unit"
        }
    else:
        # Standard field investigator / custom user ID
        clean_name = ident.split("@")[0].replace(".", " ").replace("_", " ").strip().title()
        if clean_name.lower().startswith("investigator") or clean_name.lower().startswith("agent") or clean_name.lower().startswith("officer"):
            display_name = clean_name
        else:
            display_name = f"Investigator {clean_name}"
        user_info = {
            "email": ident if "@" in ident else f"{ident}@crimenet.gov",
            "full_name": display_name,
            "role": "Field Analyst",
            "clearance": "SECRET//ORCON",
            "badge_id": f"CN-OPS-{abs(hash(ident)) % 9000 + 1000}",
            "station": "Regional Fusion Center"
        }

    token_data = {
        "sub": user_info["email"],
        "name": user_info["full_name"],
        "role": user_info["role"],
        "clearance": user_info["clearance"],
        "badge_id": user_info["badge_id"]
    }
    token = create_access_token(token_data)

    # Gather live system connection status (Database + Neo4j)
    neo_stat = neo4j_service.get_status()
    db_stat = {
        "connected": True,
        "mode": "DATABASE_ACTIVE",
        "cases_count": len(db.get_cases()),
        "evidence_count": len(db.get_evidence()),
        "candidates_count": len(CANDIDATE_GALLERY)
    }

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_info,
        "system_status": {
            "database": db_stat,
            "neo4j": neo_stat
        }
    }

@router.get("/auth/me")
def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user

@router.get("/system/connectivity")
def get_system_connectivity():
    """
    Direct system health check verifying both relational database and Neo4j connections.
    """
    neo_stat = neo4j_service.get_status()
    db_stat = {
        "connected": True,
        "status": "OPERATIONAL",
        "total_cases": len(db.get_cases()),
        "total_evidence": len(db.get_evidence()),
        "total_entities": len(CANDIDATE_GALLERY)
    }
    return {
        "database": db_stat,
        "neo4j": neo_stat,
        "api_online": True
    }

