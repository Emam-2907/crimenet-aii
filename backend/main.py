from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import (
    auth_router,
    graph_router,
    forensics_router,
    leads_router,
    entity_resolution_router,
    incidents_router,
    chat_router,
    cases_router,
    face_router,
)
from backend.neo4j_service import neo4j_service
from backend.config import ALLOWED_ORIGINS, CRIMENET_ENV
from backend.health_service import probe_system_health

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: probe Neo4j
    status = neo4j_service.get_status()
    if status["connected"]:
        print(f"[NEO4J] Connected to live graph database at {status['uri']} (DB: {status['database']})")
        neo4j_service.init_schema_constraints()
    else:
        print(f"[NEO4J] Database offline ({status['uri']}). Operating in high-speed Local Graph Cache Mode.")
    yield
    # Shutdown: gracefully close Neo4j connection pool
    neo4j_service.close()

app = FastAPI(
    title="CRIMENET AI - Cognitive Threat Matrix & Criminal Intelligence API",
    description="""
    ## Mission-Critical REST Intelligence Backend
    - **Neo4j Criminal Network Database**: Case-isolated Cypher graph analytics & pathfinding.
    - **Crime AI Copilot**: Dedicated criminal investigation assistant and warrant generator.
    - **Case Management & Evidence Intelligence**: Dockets, chain-of-custody, multi-stage processing.
    - **Computer Vision Forensics**: Facial detection, landmark alignment, and candidate matching.
    - **Entity Resolution**: Multi-source disambiguation and identity deduplication.
    - **Explainable AI Leads**: NLP wiretap entity extraction and hypothesis reasoning.
    - **Incident Command**: Real-time telemetry, threat radar, and tactical unit dispatch.
    """,
    version="3.0.0",
    docs_url="/docs" if CRIMENET_ENV != "production" else None,
    redoc_url="/redoc" if CRIMENET_ENV != "production" else None,
    lifespan=lifespan
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "img-src 'self' data: blob: https:; "
        "connect-src 'self' http://localhost:8000 https://crimenet-ai-2.vercel.app; "
        "frame-ancestors 'none';"
    )
    return response

# CORS configuration with explicit origins (No wildcard '*' with credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Gemini-Key", "X-Requested-With", "Accept"],
)

# Mount all intelligence routers
app.include_router(auth_router.router)
app.include_router(graph_router.router)
app.include_router(chat_router.router)
app.include_router(face_router.router)
app.include_router(cases_router.router)
app.include_router(forensics_router.router)
app.include_router(leads_router.router)
app.include_router(entity_resolution_router.router)
app.include_router(incidents_router.router)

@app.get("/")
def root():
    return probe_system_health()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
