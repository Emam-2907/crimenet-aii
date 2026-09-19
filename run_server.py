"""
CRIMENET AI - Dual-Engine Enterprise Launcher
Spins up both the FastAPI REST Intelligence Backend (port 8000)
and the Vite React Frontend (port 3000).
"""

import os
import sys
import subprocess
import threading
import time
import webbrowser

BACKEND_PORT = 8000
FRONTEND_PORT = 3000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def start_backend():
    print(f"[BACKEND] Initializing FastAPI Intelligence Server on port {BACKEND_PORT}...")
    try:
        import uvicorn
        from backend.main import app
        uvicorn.run(app, host="127.0.0.1", port=BACKEND_PORT, log_level="warning")
    except Exception as e:
        print(f"[BACKEND-ERROR] Failed to run uvicorn: {e}")

def main():
    print("=" * 68)
    print("[*] CRIMENET AI - COGNITIVE CRIMINAL INTELLIGENCE PLATFORM")
    print("=" * 68)
    print(f"[SYSTEM] Working Directory: {BASE_DIR}")
    print(f"[SYSTEM] Swagger OpenAPI Docs: http://localhost:{BACKEND_PORT}/docs")
    print(f"[SYSTEM] Command Console UI:  http://localhost:{FRONTEND_PORT}")
    print("=" * 68)

    # Launch FastAPI backend in daemon thread
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    backend_thread.start()

    # Small delay for backend boot
    time.sleep(1.2)

    # Launch Vite frontend
    npm_cmd = r"C:\Program Files\nodejs\npm.cmd"
    if not os.path.exists(npm_cmd):
        npm_cmd = "npm"

    print("[FRONTEND] Launching Vite React interface...")
    try:
        # Check if browser can open
        webbrowser.open(f"http://localhost:{FRONTEND_PORT}")
        subprocess.run([npm_cmd, "run", "dev", "--", "--port", str(FRONTEND_PORT), "--host"], cwd=BASE_DIR, check=True)
    except Exception as e:
        print(f"[WARN] Vite runner exited: {e}")
        # Fallback to python server serving dist
        print("[FALLBACK] Serving pre-built production bundle from dist/...")
        from http.server import SimpleHTTPRequestHandler, HTTPServer
        dist_dir = os.path.join(BASE_DIR, "dist")
        if os.path.exists(dist_dir):
            os.chdir(dist_dir)
        else:
            os.chdir(BASE_DIR)
        server = HTTPServer(('127.0.0.1', FRONTEND_PORT), SimpleHTTPRequestHandler)
        server.serve_forever()

if __name__ == '__main__':
    main()
