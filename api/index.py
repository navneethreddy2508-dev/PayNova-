"""
Vercel Serverless Function Entrypoint for FastAPI Application.
Routes incoming /api/* requests to the PayNova backend.
"""

import os
import sys

# Ensure root directory and serverless task paths are in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for path in [BASE_DIR, os.getcwd(), "/var/task"]:
    if path and path not in sys.path and os.path.exists(path):
        sys.path.insert(0, path)

try:
    from backend.main import app
    # Vercel WSGI / ASGI handler
    app = app
except Exception as e:
    import traceback
    print(f"[FATAL] Error initializing backend app in api/index.py: {e}")
    traceback.print_exc()
    raise
