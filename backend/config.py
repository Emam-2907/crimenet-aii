import os
from pathlib import Path

# Load .env file from project root if available
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent / ".env"
    load_dotenv(dotenv_path=env_path)
except ImportError:
    pass

# Authentication & Security
SECRET_KEY = os.getenv("CRIMENET_SECRET_KEY", "crimenet-ultra-classified-jwt-secret-2026-omega")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Neo4j Graph Database Configuration
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://127.0.0.1:7687")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")

# CIRA AI Assistant & Provider Configuration (Phase 4)
AI_PROVIDER = os.getenv("AI_PROVIDER", "builtin")  # "openai", "claude", "gemini", "groq", "openrouter", "ollama", "builtin"
AI_API_KEY = os.getenv("AI_API_KEY") or os.getenv("GEMINI_API_KEY", "") or os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
AI_MODEL = os.getenv("AI_MODEL", "gpt-4o")

# Default Intelligence Officer Session
DEMO_USER = {
    "email": "agent.vance@crimenet.gov",
    "password": "Crimenet2026!",
    "full_name": "Special Agent Marcus Vance",
    "role": "Chief Intelligence Analyst",
    "clearance": "TS/SCI-ORCON",
    "badge_id": "CN-ALPHA-0941",
    "station": "Metro Tactical Counter-Syndicate Command"
}
