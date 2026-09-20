# CRIMENET AI — Demo Isolation & Production Migration Guide

## 1. Overview
This document outlines the operational procedures required to safely isolate or replace demo users, transition from prototype demo fixtures to enterprise data stores, and configure CRIMENET AI for production environments.

---

## 2. Environment Isolation (`CRIMENET_ENV`)

CRIMENET AI enforces environment isolation via the `CRIMENET_ENV` variable:
- `CRIMENET_ENV=demo` (Default in local/prototype): Enables synthetic demo accounts (`analyst.vance@crimenet.demo`, `investigator.chen@crimenet.demo`, `supervisor.wright@crimenet.demo`, `admin@crimenet.demo`). Ingests synthetic fixtures (`CR-204`).
- `CRIMENET_ENV=production` or `staging`: **Disables all demo accounts**. Any authentication attempt against demo accounts is rejected with generic unauthorized errors. Requires genuine external identity provider (IdP) or database-backed credentials.

### Transitioning to Production Mode
1. Set the environment variable in your hosting platform (e.g. Vercel / AWS / Docker):
   ```bash
   CRIMENET_ENV=production
   ```
2. Generate and set a cryptographically random 64-character secret key:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   # Example output: 4a9f8b...
   CRIMENET_SECRET_KEY=<generated_value>
   ```
3. Verify that the server fails closed if `CRIMENET_SECRET_KEY` is omitted in production mode.

---

## 3. Replacing Demo Users with Real Directory Services

In demo mode, users are resolved from `DEMO_ACCOUNTS` in `backend/config.py`. In production, replace this with an enterprise directory service or database:

### Option A: OIDC / SAML 2.0 Identity Provider (Recommended)
1. Integrate an OpenID Connect (OIDC) middleware (e.g., Auth0, Okta, Keycloak, Azure AD) into `backend/routers/auth_router.py`.
2. Extract the authenticated user's email, role, and clearance from verified IdP claims.
3. Map enterprise group claims to CRIMENET roles:
   - `CN-Supervisors` $\rightarrow$ `SUPERVISOR`
   - `CN-SpecialAgents` $\rightarrow$ `INVESTIGATOR`
   - `CN-IntelligenceAnalysts` $\rightarrow$ `ANALYST`
   - `CN-SecurityOfficers` $\rightarrow$ `ADMIN`

### Option B: Relational Database Backing (PostgreSQL)
1. Provision a PostgreSQL 15+ database instance.
2. Create the `users` table with salted password hashes:
   ```sql
   CREATE TABLE users (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       email VARCHAR(255) UNIQUE NOT NULL,
       password_hash VARCHAR(255) NOT NULL,
       full_name VARCHAR(150) NOT NULL,
       role VARCHAR(50) NOT NULL CHECK (role IN ('INVESTIGATOR', 'ANALYST', 'SUPERVISOR', 'ADMIN')),
       clearance VARCHAR(50) NOT NULL DEFAULT 'SECRET',
       badge_id VARCHAR(50) UNIQUE NOT NULL,
       allowed_cases TEXT[] DEFAULT ARRAY['*'],
       is_active BOOLEAN DEFAULT TRUE,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```
3. Update `backend/auth_service.py` to query PostgreSQL rather than `DEMO_ACCOUNTS`.

---

## 4. Replacing In-Memory Stores with Distributed Infrastructure

The prototype currently maintains rate limits, revoked tokens, and audit logs in process memory. For multi-node or serverless deployments, migrate these stores to distributed services:

### 4.1 Token Blacklist & Rate Limiting (Redis)
Replace `REVOKED_TOKENS = set()` and `FAILED_ATTEMPTS` in `backend/auth_service.py` with Redis commands:
```python
import redis

redis_client = redis.Redis.from_url(os.getenv("REDIS_URL"))

def revoke_token(jti: str, exp_seconds: int = 1800) -> None:
    redis_client.setex(f"blacklist:{jti}", exp_seconds, "revoked")

def is_token_revoked(jti: str) -> bool:
    return bool(redis_client.exists(f"blacklist:{jti}"))
```

### 4.2 Append-Only Audit Logging (PostgreSQL / OpenSearch)
Replace in-memory `AUDIT_LOG_STORE` in `backend/audit_service.py` with a write-only database table:
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actor VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    case_id VARCHAR(100),
    result VARCHAR(20) NOT NULL,
    request_id VARCHAR(100),
    source_ip VARCHAR(45),
    details JSONB
);

-- Revoke UPDATE and DELETE permissions from the application user to ensure append-only integrity
REVOKE UPDATE, DELETE ON audit_logs FROM crimenet_app_user;
```

---

## 5. Replacing Synthetic CR-204 Fixture with Live Case Ingestion

1. Set `CRIMENET_ENV=production`.
2. Disable synthetic fixture loading by configuring `backend/database.py` to initialize an empty graph and case docket until cases are ingested via authorized POST endpoints.
3. Use the schema-validated ingestion endpoints:
   - `POST /api/cases` (Requires `INVESTIGATOR` or higher)
   - `POST /api/cases/{case_id}/evidence` (Requires `ANALYST` or higher)
   - `POST /api/cases/{case_id}/graph/nodes` (Requires `ANALYST` or higher)
4. Ensure all ingested multimedia assets and camera feeds are verified for legal chain-of-custody compliance.

---

## 6. Secret Rotation Procedure

1. **Active Secret Rotation**:
   - To rotate `CRIMENET_SECRET_KEY` without immediately invalidating all active sessions, configure a secondary verification key in `backend/config.py`:
     ```python
     SECRET_KEY = os.getenv("CRIMENET_SECRET_KEY")
     PREVIOUS_SECRET_KEY = os.getenv("CRIMENET_PREVIOUS_SECRET_KEY")
     ```
   - Validate incoming tokens against `SECRET_KEY` first, then fall back to `PREVIOUS_SECRET_KEY`.
   - Issue all new tokens signed exclusively with `SECRET_KEY`.
   - After the 30-minute session expiry window passes, remove `CRIMENET_PREVIOUS_SECRET_KEY`.
