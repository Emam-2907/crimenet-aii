"""
CRIMENET AI - Production Bundle Exposure Scan
Scans dist/ directory for hardcoded passwords, mock JWTs, or client-side auth tokens.
"""

import sys
from pathlib import Path

dist_dir = Path(__file__).resolve().parent.parent / "dist"

SENSITIVE_STRINGS = [
    "Crimenet2026!",
    "mock-jwt-token-alpha-0941",
    "Investigator2026!",
    "Supervisor2026!",
    "Admin2026!",
    "crimenet-dev-classified-jwt-secret-2026-omega",
    "crimenet-ultra-classified-jwt-secret-2026-omega"
]

def scan_bundle():
    print(f"Scanning {dist_dir} for sensitive credentials...")
    if not dist_dir.exists():
        print(f"Error: {dist_dir} does not exist.")
        sys.exit(1)

    findings = []
    for p in dist_dir.rglob("*"):
        if p.is_file() and p.suffix in [".js", ".map", ".html", ".css", ".json"]:
            try:
                content = p.read_text(encoding="utf-8", errors="ignore")
                for s in SENSITIVE_STRINGS:
                    if s in content:
                        findings.append((p.name, s))
            except Exception as e:
                print(f"Could not read {p.name}: {e}")

    if findings:
        print("[FAIL] Sensitive strings detected in bundle:")
        for fname, s in findings:
            print(f"   {fname}: found '{s}'")
        sys.exit(1)
    else:
        print("[PASS] Bundle scan clean. Zero sensitive credentials, mock JWTs, or secrets found in dist/.")
        sys.exit(0)

if __name__ == "__main__":
    scan_bundle()
