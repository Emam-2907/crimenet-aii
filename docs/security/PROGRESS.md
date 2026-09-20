# CRIMENET AI - Security Hardening & Integration Progress

## Phase 1: Inspection & Security Audit (Read-Only)
**Date/Time**: 2026-09-20T11:05:00Z  
**Status**: COMPLETED

### 1. What Changed
- Executed comprehensive static and dynamic read-only audit across frontend, backend, deployment configuration, and bundle assets.
- Generated comprehensive Phase 1 Audit Report at `docs/security/PHASE1_AUDIT.md`.
- No source code modifications were made during this phase.

### 2. Tests Run & Real Command Output

#### A. Source Code & Configuration Audit
Command:
```powershell
python "C:\Users\Emam M\.gemini\antigravity-ide\brain\31b2e628-33b0-4e3f-94db-6b6757c7d22e\scratch\phase1_audit_inspector.py"
```
Output:
```
--- VERCEL CONFIG ---
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "backend/main.py"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}

--- ENV NAMES AUDIT ---
Vite client prefixes: []
Server env names referenced: ['CRIMENET_SECRET_KEY', 'CRIMENET_GEMINI_KEY', 'NEO4J_URI', 'NEO4J_USERNAME', 'NEO4J_PASSWORD', 'NEO4J_DATABASE']
CRITICAL: No .env values printed or committed.

--- FRONTEND MOCK AUTH & STORAGE SEARCH ---
src\components\LoginPage.jsx:68:              onChange={(e) => setBadgeId(e.target.value)}
src\components\LoginPage.jsx:78:              onChange={(e) => setPassword(e.target.value)}
src\services\api.js:47:    // Fallback: Return synthetic mock token for offline/demo operation
src\services\api.js:52:      token: 'mock-jwt-token-alpha-0941',
src\services\api.js:54:        id: badgeId || 'INV-8821',
src\services\api.js:57:        role: 'Field Analyst'
```

#### B. Production Bundle Inspection
Command:
```powershell
python "C:\Users\Emam M\.gemini\antigravity-ide\brain\31b2e628-33b0-4e3f-94db-6b6757c7d22e\scratch\scan_dist.py"
```
Output:
```
Scanning C:\Users\Emam M\Documents\crimenet ai 2\dist for sensitive strings...
Matches in C:\Users\Emam M\Documents\crimenet ai 2\dist\assets\index-Cnu2X0FM.js:
  - 'Crimenet2026!': 1 occurrences
  - 'mock-jwt-token-alpha-0941': 1 occurrences
  - 'PERSON-001': 1 occurrences
  - 'NY-889XQ': 1 occurrences
  - '8B9-CYP': 1 occurrences
  - 'ev_': 1 occurrences
```

#### C. Live Deployed Site Probing (`https://crimenet-ai-2.vercel.app`)
Command:
```powershell
python "C:\Users\Emam M\.gemini\antigravity-ide\brain\31b2e628-33b0-4e3f-94db-6b6757c7d22e\scratch\audit_deployed_site.py"
```
Output:
```
--- PROBING https://crimenet-ai-2.vercel.app ---
Status Code: 200
Headers:
  Content-Type: text/html; charset=utf-8
  Access-Control-Allow-Origin: *
  Server: Vercel
Security Headers Missing:
  - Content-Security-Policy: MISSING
  - X-Frame-Options: MISSING
  - X-Content-Type-Options: MISSING
  - Referrer-Policy: MISSING
  - Permissions-Policy: MISSING

--- DIRECT API CALLS WITHOUT AUTH ---
GET /api/cases: 404 (or routed to index.html rewrite)
GET /api/health: 404 (or routed to index.html rewrite)
```

### 3. Failures Identified
- **SEC-01 (CRITICAL)**: Client-side mock auth fallback in `src/services/api.js` automatically creates an authenticated session with `mock-jwt-token-alpha-0941` whenever backend is unreachable.
- **SEC-02 (CRITICAL)**: Server-side `backend/routers/auth_router.py` does not authenticate passwords against any hashed credential store and creates arbitrary tokens for any badge ID.
- **SEC-03 (CRITICAL)**: 56 of 57 backend API endpoints lack `Depends(get_current_user)` authentication and case-level authorization.
- **SEC-04 (HIGH)**: `backend/main.py` configures `allow_origins=["*"]` with `allow_credentials=True`.
- **SEC-05 (HIGH)**: `vercel.json` lacks CSP, X-Frame-Options, and X-Content-Type-Options.
- **SEC-06 (MEDIUM)**: Sensitive synthetic investigation data, demo passwords, and plates are bundled in client JS.
- **SEC-07 (MEDIUM)**: False "Connected / Operational" telemetry is reported in `LoginPage.jsx` when offline.

### 4. Remaining Limitations
- Headless browser subagent was blocked by Playwright CDN 404 on Windows; automated HTTP probing script was used instead to gather header and API responses.
- Backend server is deployed as serverless functions on Vercel; live testing confirmed the root rewrites require verification once backend functions are configured.
