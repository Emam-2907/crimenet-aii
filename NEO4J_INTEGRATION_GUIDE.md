# CRIMENET AI — Phase 3: Neo4j Criminal Network Database Integration Guide

This guide details the architecture, configuration, operation, and verification of the Neo4j-powered full-stack criminal network analysis system in **CRIMENET AI**.

---

## 1. System Architecture Overview

```
                      CRIMENET AI CONSOLE
            (Special Agent Marcus Vance / Terminal UI)
                                │
                                ▼
                   ┌─────────────────────────┐
                   │   React + Vite (UI)     │
                   │   Cytoscape.js Canvas   │
                   │   Port 3000             │
                   └────────────┬────────────┘
                                │
                                │ REST API (JSON)
                                ▼
                   ┌─────────────────────────┐
                   │   FastAPI Backend Core  │
                   │   Intelligence Routers  │
                   │   Port 8000             │
                   └────────────┬────────────┘
                                │
                                │ Official Bolt Protocol
                                ▼
                   ┌─────────────────────────┐
                   │   Neo4j Graph Database  │
                   │   Port 7687 / 7474      │
                   └─────────────────────────┘
```

---

## 2. Neo4j Data Model & Case Isolation

The Neo4j graph strictly partitions all intelligence artifacts by `case_id` (e.g., `CASE #CR-2026-0142`). Queries for one docket will never leak entities or edges from another docket.

### Core Node Labels
- `(:Case { id, title, priority, status, dataset })`
- `(:Evidence { id, case_id, filename, type, source, hash, processing_status })`
- `(:Person { id, case_id, name, threat, confidence, entity_type })`
- `(:Phone { id, case_id, number, threat, entity_type })`
- `(:Vehicle { id, case_id, registration, make_model, threat, entity_type })`
- `(:FinancialAccount { id, case_id, account_identifier, threat, entity_type })`
- `(:Location { id, case_id, name, address, threat, entity_type })`
- `(:Organization { id, case_id, name, org_type, threat, entity_type })`

### Relationship Types & Visual Styles
| Relationship Type | Source → Target | Visual Line Style | Color |
| :--- | :--- | :--- | :--- |
| `CALLS` / `CALLED` / `USES` | Person → Phone / Person | Cyan Dashed | `#38bdf8` |
| `TRANSACTED_WITH` / `MANAGES_ESCROW` | Person → Financial Account | Emerald Solid (3px) | `#34d399` |
| `OWNS` / `OPERATES_VEHICLE` | Person → Vehicle | Amber Solid | `#fbbf24` |
| `LOCATED_AT` / `FREQUENTS` | Person / Vehicle → Location | Purple Dotted | `#c084fc` |
| `WORKS_FOR` | Person → Organization | Pink Solid | `#f472b6` |
| `SUPPORTS` | Evidence → Entity | Royal Blue Solid | `#60a5fa` |

---

## 3. Installation & Setup

### A. Installing Neo4j
You can use any of the following options:

1. **Neo4j Desktop (Recommended for Windows)**:
   - Download from [https://neo4j.com/download/](https://neo4j.com/download/).
   - Create a local database named `neo4j` (default port `7687`).
   - Set password (e.g. `password` or your custom secret).
2. **Neo4j Aura (Free Cloud Database)**:
   - Create a free instance at [https://neo4j.com/cloud/aura/](https://neo4j.com/cloud/aura/).
   - Copy connection URI (e.g. `neo4j+s://xxxx.databases.neo4j.io`) and credentials.
3. **Docker**:
   ```bash
   docker run -d --name crimenet-neo4j -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:latest
   ```

### B. Configuring Environment (`.env`)
Create `.env` in the project root:
```ini
NEO4J_URI=bolt://127.0.0.1:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
NEO4J_DATABASE=neo4j

CRIMENET_SECRET_KEY=crimenet-ultra-classified-jwt-secret-2026-omega
```

*(Note: Neo4j credentials are strictly backend-only and never exposed to the React frontend).*

---

## 4. Running the Platform

### Dual Launcher (FastAPI on Port 8000 + Vite on Port 3000)
```bash
python run_server.py
```

### Or Start Individually:
- **FastAPI Backend**:
  ```bash
  uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
  ```
- **Vite React Frontend**:
  ```bash
  npm run dev -- --port 3000
  ```

---

## 5. Schema Constraints & Synthetic Data Seeding

### Verify Connectivity Only:
```bash
python seed_demo_data.py --verify
```

### Seed Synthetic Case Network (`CASE #CR-2026-0142`):
```bash
python seed_demo_data.py --case "CASE #CR-2026-0142"
```

### Clear and Re-Seed:
```bash
python seed_demo_data.py --case "CASE #CR-2026-0142" --clear
```

All synthetic demo data is explicitly marked with `dataset: 'DEMO / SYNTHETIC DATA'` and does not contain real PII.

---

## 6. REST API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/graph/status` | `GET` | Returns Neo4j driver connection health & mode. |
| `/api/cases/{case_id}/graph` | `GET` | Retrieves case-isolated nodes and edges with shapes. |
| `/api/cases/{case_id}/entities` | `GET` | Lists all entities in the case docket. |
| `/api/cases/{case_id}/relationships` | `GET` | Lists all relationships in the case docket. |
| `/api/entities/{entity_id}` | `GET` | Deep inspection of an entity, properties, and evidence. |
| `/api/relationships/{rel_id}` | `GET` | Deep inspection of a relationship and confidence score. |
| `/api/cases/{case_id}/graph/path` | `POST` | Executes Cypher shortest path between two entities. |
| `/api/cases/{case_id}/graph/expand` | `POST` | Discovers 1-hop neighborhood connections. |
| `/api/cases/{case_id}/graph/analytics` | `GET` | Computes neutral degree metrics & density. |

---

## 7. Operational Resilience (Dual-Engine Operation)

CRIMENET AI features a resilient dual-engine architecture:
1. **Live Neo4j Mode**: When Neo4j is running and reachable, all Cypher queries execute in real time directly against Neo4j.
2. **Local Cache Fallback Mode**: If Neo4j is offline or temporarily undergoing maintenance, the backend automatically switches to its local graph engine while displaying an explicit status indicator (`Neo4j: Local Cache Mode`), ensuring that investigators can continue testing, searching, filtering, and pathfinding without application crashes or downtime.
