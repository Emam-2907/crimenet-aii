# PHASE 1: COMPREHENSIVE SECURITY, ARCHITECTURE & DATA INTEGRITY AUDIT
**Target Application**: CRIMENET AI (Synthetic Prototype)  
**Deployed Location**: https://crimenet-ai-2.vercel.app  
**Audit Date**: 2026-09-20  
**Auditor Role**: Senior Full-Stack Security Engineer, AppSec Engineer, Data Architect & Product Designer  
**Scope**: Complete Static & Dynamic Inspection (Phase 1 Read-Only Assessment)

---

## 1. Architecture & Technology Stack Mapping

### 1.1 Frontend Architecture
- **Framework & Runtime**: React 18.3.1 with Vite 5.4.21 as the build tool and development server.
- **Routing**: Client-side state-based routing (`stage = 'login' | 'workstation'` in `App.jsx`, `activePage = 'dashboard' | 'cases' | 'workspace' | 'graph' | 'evidence' | 'faceid' | 'intel' | 'chat' | 'settings'` in `CIRAContext.jsx`).
- **State Management**: React Context API (`CIRAContext.jsx`) managing user sessions, active cases, evidence, subject targets, and navigation. No unified typed investigation context currently exists across all forensic views.
- **Visuals & Graph**: Cytoscape.js 3.34.3 with `cytoscape-cose-bilkent` 4.1.0 layout engine. Lucide React 0.344.0 icons.
- **Styling**: Vanilla CSS (`index.css`) with custom CSS variables (`--bg-main`, `--ink-0`, `--green`, `--blue`, `--red`, `--amber`) and dark tactical styling.

### 1.2 Backend Architecture
- **Framework**: FastAPI 3.0.0 (Python 3.14 runtime) running with Uvicorn.
- **Database & Persistence**:
  - In-memory relational emulation in `backend/database.py` (`db` singleton storing cases, evidence, incidents, suspects).
  - Graph database: Neo4j (via `neo4j` Python driver 5.28.1), configured in `backend/neo4j_service.py` with fallback to in-memory graph cache when offline.
- **AI & Analytics Services**:
  - CIRA (Case Intelligence Reasoning Assistant) in `backend/cira/` (dialogue engine, forensics engine, tactical reasoning, profiling engine).
  - Face Intelligence in `backend/face_intelligence_service.py` (biometric matching simulation against candidate gallery).
  - Direct Google Gemini API support via `CRIMENET_GEMINI_KEY`.
- **API Surface**: 57 total endpoints across 9 routers:
  - `auth_router.py`: 3 endpoints (`/auth/login`, `/auth/me`, `/system/connectivity`)
  - `cases_router.py`: 10 endpoints (`/api/cases`, `/api/evidence`, etc.)
  - `graph_router.py`: 14 endpoints (`/api/cases/{case_id}/graph`, pathfinding, expansion)
  - `chat_router.py`: 14 endpoints (`/api/cira/chat`, context, conversations)
  - `face_router.py`: 8 endpoints (`/api/cases/{case_id}/face/*`)
  - `forensics_router.py`: 4 endpoints (`/detect-face`, `/match-candidates`, etc.)
  - `leads_router.py`: 3 endpoints (`/extract-entities`, `/generate-leads`)
  - `entity_resolution_router.py`: 2 endpoints (`/cases`, `/merge`)
  - `incidents_router.py`: 2 endpoints (`/`, `/{incident_id}/dispatch`)

### 1.3 Deployment Configuration (`vercel.json`)
- **Hosting**: Vercel Serverless Static Platform.
- **Rewrites**: `[ { "source": "/(.*)", "destination": "/index.html" } ]`.
- **Limitation**: The FastAPI Python backend is **NOT** deployed on Vercel; Vercel only serves the static React SPA. When the frontend attempts to call `/api/*` or `http://localhost:8000/api/*`, requests fail or return `index.html`.
- **Security Headers**: Completely missing from `vercel.json`.

### 1.4 Environment Variable Names (Names Only - Zero Secret Values Printed)
- `CRIMENET_SECRET_KEY`
- `CRIMENET_GEMINI_KEY`
- `NEO4J_URI`
- `NEO4J_USERNAME`
- `NEO4J_PASSWORD`
- `NEO4J_DATABASE`

---

## 2. Security Vulnerability Findings

### Finding SEC-01: Client-Side Authentication Bypass & Mock JWT Generation
- **Severity**: CRITICAL
- **Location**: `src/services/api.js:47-68`
- **Evidence**:
  ```javascript
  } catch (e) {
    console.warn('[API] Backend unreachable or auth error. Using authenticated fallback session.', e);
    const mockUser = {
      access_token: 'mock-jwt-token-alpha-0941',
      user: { ... role: 'Chief Intelligence Analyst', clearance: 'TS/SCI-ORCON' },
      system_status: { database: { connected: true, mode: 'DATABASE_ACTIVE' } }
    };
    api.setToken(mockUser.access_token);
    return mockUser;
  }
  ```
- **Impact**: Any user entering arbitrary or invalid credentials on the deployed site (`https://crimenet-ai-2.vercel.app`) is automatically logged in as a Top Secret authorized agent. Fulfills zero authentication requirements.
- **Remediation**: Remove client-side mock session creation. If backend authentication fails or credentials are invalid, fail closed with a generic authentication error.

---

### Finding SEC-02: Backend Unauthenticated Password Acceptance & In-Memory User Generation
- **Severity**: CRITICAL
- **Location**: `backend/routers/auth_router.py:49-115`
- **Evidence**:
  ```python
  ident = (request.user_id or request.email or "").strip()
  pwd = (request.password or "").strip()
  if not ident or not pwd:
      raise HTTPException(status_code=400, detail="User ID and Password are required.")
  # No password hash verification exists! Any password is accepted.
  ```
- **Impact**: Any password is accepted for any account. Furthermore, unrecognized user IDs are dynamically assigned the role "Field Analyst" and issued valid signed JWTs.
- **Remediation**: Implement Argon2id/bcrypt password hash verification. Store valid accounts strictly server-side under an isolated DEMO environment flag. Reject unknown accounts with generic error responses.

---

### Finding SEC-03: Broken Object Level Authorization (BOLA) & 56 Unprotected Endpoints
- **Severity**: CRITICAL
- **Location**: `backend/routers/cases_router.py`, `backend/routers/graph_router.py`, `backend/routers/chat_router.py`, `backend/routers/face_router.py`
- **Evidence**: 56 out of 57 endpoints do not include `Depends(get_current_user)`. Only `/auth/me` verifies the bearer token.
- **Impact**: Unauthenticated HTTP requests can access, modify, and delete case dockets, evidence, graph relationships, and chat logs.
- **Remediation**: Enforce `Depends(get_current_user)` and case-level RBAC checks across all routes.

---

### Finding SEC-04: Wildcard CORS on Authenticated APIs
- **Severity**: HIGH
- **Location**: `backend/main.py:40-46`
- **Evidence**:
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
- **Impact**: Wildcard origin with credentials enabled violates standard CORS specifications and exposes the API to cross-site request forgery and data exfiltration.
- **Remediation**: Explicitly configure allowed origins (`http://localhost:3000`, `http://localhost:5173`, `https://crimenet-ai-2.vercel.app`).

---

### Finding SEC-05: Missing HTTP Security Headers & Frame Protection
- **Severity**: HIGH
- **Location**: `vercel.json` / Deployed Site (`https://crimenet-ai-2.vercel.app`)
- **Evidence**:
  - `Content-Security-Policy`: MISSING
  - `X-Frame-Options`: MISSING
  - `X-Content-Type-Options`: MISSING
  - `Referrer-Policy`: MISSING
  - `Permissions-Policy`: MISSING
  - `Access-Control-Allow-Origin: *` returned on static HTML responses.
- **Impact**: Site is vulnerable to clickjacking, MIME-sniffing, and cross-site scripting (XSS).
- **Remediation**: Configure security headers in `vercel.json`.

---

### Finding SEC-06: Sensitive Synthetic Case Data Leaked in Frontend Production Bundle
- **Severity**: MEDIUM
- **Location**: `dist/assets/index-*.js`
- **Evidence**: Grepping `dist/` revealed hardcoded demo password (`Crimenet2026!`), 22 occurrences of suspect `PERSON-001`, license plates (`NY-889XQ`, `8B9-CYP`), Tether wallet addresses, and evidence filenames bundled directly in client JavaScript.
- **Impact**: Case details, suspect identities, and intelligence records are completely readable by anyone downloading the static JavaScript bundle without authentication.
- **Remediation**: Move all case, entity, and evidence data behind authenticated API endpoints. Frontend bundle must contain UI logic only.

---

### Finding SEC-07: Untruthful Health Telemetry & Fabricated "Live" Status
- **Severity**: MEDIUM
- **Location**: `src/components/LoginPage.jsx:54-56`, `src/services/api.js:61-64`
- **Evidence**:
  ```javascript
  database: { connected: true, status: 'LOCAL_STANDALONE', total_cases: 3, total_evidence: 8 }
  ```
  When the backend is down, the UI displays "Connected" and "Operational" rather than truthfully reporting that the server is unreachable.
- **Impact**: Violates Core Principle: "Never show Connected/Live until a real health check exists."
- **Remediation**: Implement truthful status model: `LIVE | DEGRADED | CACHED | OFFLINE | DEMO`.

---

### Finding SEC-08: Token Authority via Insecure LocalStorage
- **Severity**: MEDIUM
- **Location**: `src/services/api.js:10-18`
- **Evidence**: `authToken` is loaded and saved directly in `localStorage.getItem('crimenet_token')`.
- **Impact**: Tokens stored in `localStorage` are vulnerable to extraction via XSS.
- **Remediation**: Transition to HttpOnly, Secure, SameSite session cookies.

---

## 3. Accessibility & Responsiveness Assessment

### 3.1 Accessibility Findings (WCAG 2.2 AA)
1. **Low Contrast on Secondary Text**:
   - `var(--t-dim)` (`#64748B`) on background `#080C14` yields a contrast ratio of ~3.5:1, failing the 4.5:1 minimum for normal text.
2. **Missing Accessible Labels**:
   - Icon-only buttons (fullscreen, zoom in, zoom out, fit, reload) lack `aria-label`.
   - Password visibility toggle lacks `aria-label="Show password"` / `"Hide password"`.
3. **Screen Reader Announcements**:
   - Status changes (e.g. filter updates, connection status, CIRA responses) lack `aria-live` regions.

### 3.2 Responsiveness Findings (375px / 768px / 1280px)
1. **Mobile Viewport (375px)**:
   - Fixed-width graph drawer (`380px`) overflows the 375px screen width.
   - Classification header text overlaps on narrow viewports.
2. **Tablet Viewport (768px)**:
   - Data tables in Evidence and Workspace require horizontal scrolling rather than responsive card reflow.
3. **Desktop (1280px)**:
   - Primary workstation layout displays properly.

---

## 4. Prioritized Remediation Roadmap

1. **Phase 2 (Immediate Security & Auth)**:
   - Remove mock auth and client JWT generation.
   - Implement server-side login with rate limiting and generic error responses.
   - Secure all 57 endpoints with `Depends(get_current_user)` and case RBAC.
   - Restrict CORS and configure security headers in `vercel.json`.
   - Implement truthful health checks (`LIVE | DEGRADED | OFFLINE | DEMO`).
2. **Phase 3 (Data Architecture & CR-204 Integration)**:
   - Establish ONE unified investigation context.
   - Implement synthetic case `CR-204` with complete provenance, information gaps, and conflicting records.
   - Synchronize Graph $\leftrightarrow$ Map $\leftrightarrow$ CCTV $\leftrightarrow$ Timeline $\leftrightarrow$ Evidence $\leftrightarrow$ CIRA.
   - Ground CIRA in deterministic fact bundles with truthful phrasing.
3. **Phase 4 & 5 (Verification & Polish)**:
   - Automated security and integration test suite.
   - WCAG 2.2 AA contrast, accessible labels, responsive mobile cards.
