from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import auth_router, graph_router, forensics_router, leads_router, entity_resolution_router, incidents_router, chat_router, cases_router, face_router
from backend.neo4j_service import neo4j_service

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
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration allowing local frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all intelligence routers (graph_router and chat_router mounted first for exact case precedence)
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
def health_check():
    neo_stat = neo4j_service.get_status()
    return {
        "service": "CRIMENET AI Intelligence Core",
        "status": "OPERATIONAL",
        "version": "3.0.0",
        "clearance_level": "ORCON-RESTRICTED",
        "graph_database": {
            "connected": neo_stat["connected"],
            "engine": neo_stat["mode"],
            "uri": neo_stat["uri"]
        },
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
