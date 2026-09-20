"""
CRIMENET AI - Server-Controlled Append-Only Audit Logging Service
Records security-critical actions: login, logout, failed login, case access,
evidence upload/download, AI analysis, entity edits, approvals, permission changes.
Sensitive payloads (passwords, tokens, biometric feature vectors) are strictly excluded.
Client cannot write directly to this service.
"""

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional

AUDIT_LOG_DIR = Path(__file__).resolve().parent / "data"
AUDIT_LOG_DIR.mkdir(parents=True, exist_ok=True)
AUDIT_LOG_FILE = AUDIT_LOG_DIR / "audit_log.jsonl"

class AuditService:
    def __init__(self):
        self._in_memory_logs: List[Dict[str, Any]] = []
        self._load_existing_logs()

    def _load_existing_logs(self):
        if AUDIT_LOG_FILE.exists():
            try:
                with open(AUDIT_LOG_FILE, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line:
                            self._in_memory_logs.append(json.loads(line))
            except Exception as e:
                print(f"[AUDIT] Warning: could not load existing logs: {e}")

    def log_event(
        self,
        action: str,
        actor: str,
        resource: str,
        result: str,
        case_id: Optional[str] = None,
        source_ip: str = "127.0.0.1",
        request_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Append an audit event.
        NEVER pass passwords, credentials, tokens, or biometric vectors in details.
        """
        # Sanitize details to guarantee no sensitive keys
        clean_details = {}
        if details:
            for k, v in details.items():
                if any(bad in k.lower() for bad in ["password", "token", "secret", "key", "vector", "credential"]):
                    continue
                clean_details[k] = str(v)[:200]

        event = {
            "id": f"aud-{uuid.uuid4().hex[:12]}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "actor": actor,
            "action": action,
            "resource": resource,
            "case_id": case_id,
            "result": result,  # "SUCCESS", "DENIED", "FAILED"
            "request_id": request_id or str(uuid.uuid4()),
            "source_ip": source_ip,
            "details": clean_details
        }

        # Append-only in-memory
        self._in_memory_logs.append(event)

        # Append-only file persistence
        try:
            with open(AUDIT_LOG_FILE, "a", encoding="utf-8") as f:
                f.write(json.dumps(event) + "\n")
        except Exception as e:
            print(f"[AUDIT] Warning: file append failed: {e}")

        return event

    def get_logs(
        self,
        case_id: Optional[str] = None,
        actor: Optional[str] = None,
        action: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Query audit logs with optional filters. Restricted to SUPERVISOR and ADMIN.
        """
        filtered = self._in_memory_logs
        if case_id:
            filtered = [e for e in filtered if e.get("case_id") == case_id]
        if actor:
            filtered = [e for e in filtered if e.get("actor") == actor]
        if action:
            filtered = [e for e in filtered if e.get("action") == action]

        return filtered[-limit:][::-1]

audit_service = AuditService()
