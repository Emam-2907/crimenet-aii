import os
import hashlib
import secrets
from pathlib import Path
from typing import Dict, Any, List

# Load .env file from project root if available (NEVER logged or committed)
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(dotenv_path=env_path)
except ImportError:
    pass

# Environment: "demo", "development", "staging", "production"
CRIMENET_ENV = os.getenv("CRIMENET_ENV", "demo").lower()
if CRIMENET_ENV not in ["demo", "development", "staging", "production"]:
    CRIMENET_ENV = "demo"

# Authentication & Security
SECRET_KEY = os.getenv("CRIMENET_SECRET_KEY")
if not SECRET_KEY:
    if CRIMENET_ENV == "production":
        raise RuntimeError("FATAL: CRIMENET_SECRET_KEY must be set in production.")
    SECRET_KEY = "crimenet-dev-classified-jwt-secret-2026-omega-secure-key-32b"

ALGORITHM = "HS256"
# Short-lived token: 30 minutes
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Allowed CORS origins
DEFAULT_ORIGINS = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:8000,https://crimenet-aii.vercel.app,https://crimenet-aii-emam-2907.vercel.app,https://crimenet-ai-2.vercel.app"
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", DEFAULT_ORIGINS).split(",")
    if origin.strip()
]

# Password Hashing Utilities using PBKDF2-HMAC-SHA256
def hash_password(password: str, salt: str = None) -> str:
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    )
    return f"{salt}${key.hex()}"

def verify_password(stored_password: str, provided_password: str) -> bool:
    try:
        salt, key_hex = stored_password.split("$", 1)
        expected_key = hashlib.pbkdf2_hmac(
            "sha256",
            provided_password.encode("utf-8"),
            salt.encode("utf-8"),
            100000
        )
        return secrets.compare_digest(key_hex, expected_key.hex())
    except Exception:
        return False

# Synthetic Demo Accounts (ONLY accessible when CRIMENET_ENV == "demo")
# Demo passwords are pre-hashed with PBKDF2
DEMO_ACCOUNTS: Dict[str, Dict[str, Any]] = {}
if CRIMENET_ENV == "demo":
    DEMO_ACCOUNTS = {
        "analyst.vance@crimenet.demo": {
            "email": "analyst.vance@crimenet.demo",
            "password_hash": hash_password("Crimenet2026!", salt="demo_salt_vance_01"),
            "full_name": "Special Agent Marcus Vance",
            "role": "ANALYST",
            "clearance": "TS/SCI-ORCON",
            "badge_id": "CN-ALPHA-0941",
            "station": "Metro Tactical Counter-Syndicate Command",
            "allowed_cases": ["CR-204", "CASE #CR-2026-0142", "CASE #CR-2026-0089", "ER-CASE-094", "ER-CASE-095", "ER-CASE-096"]
        },
        "investigator.chen@crimenet.demo": {
            "email": "investigator.chen@crimenet.demo",
            "password_hash": hash_password("Investigator2026!", salt="demo_salt_chen_02"),
            "full_name": "Detective Sarah Chen",
            "role": "INVESTIGATOR",
            "clearance": "SECRET",
            "badge_id": "CN-INV-5512",
            "station": "Major Case Investigation Unit",
            "allowed_cases": ["CR-204", "ER-CASE-094", "ER-CASE-095", "ER-CASE-096"]
        },
        "supervisor.wright@crimenet.demo": {
            "email": "supervisor.wright@crimenet.demo",
            "password_hash": hash_password("Supervisor2026!", salt="demo_salt_wright_03"),
            "full_name": "Inspector Thomas Wright",
            "role": "SUPERVISOR",
            "clearance": "TS//SCI",
            "badge_id": "CN-SUP-7719",
            "station": "Regional Fusion Command",
            "allowed_cases": ["*"]
        },
        "admin@crimenet.demo": {
            "email": "admin@crimenet.demo",
            "password_hash": hash_password("Admin2026!", salt="demo_salt_admin_04"),
            "full_name": "Command Administrator",
            "role": "ADMIN",
            "clearance": "TS//SCI-ORCON",
            "badge_id": "CN-HQ-0001",
            "station": "Joint Intelligence Headquarters",
            "allowed_cases": ["*"]
        }
    }

def get_demo_profiles() -> List[Dict[str, Any]]:
    """Returns safe, unprivileged public metadata for demo persona quick-selection."""
    if CRIMENET_ENV != "demo":
        return []
    profiles = []
    for email, acc in DEMO_ACCOUNTS.items():
        profiles.append({
            "email": acc["email"],
            "full_name": acc["full_name"],
            "role": acc["role"],
            "clearance": acc["clearance"],
            "badge_id": acc["badge_id"],
            "station": acc["station"]
        })
    return profiles

# Neo4j Graph Database Configuration
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://127.0.0.1:7687")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")

# CIRA AI Assistant Configuration
AI_PROVIDER = os.getenv("AI_PROVIDER", "builtin")
AI_API_KEY = os.getenv("AI_API_KEY") or os.getenv("GEMINI_API_KEY", "") or os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
AI_MODEL = os.getenv("AI_MODEL", "gpt-4o")

