"""
Vercel Serverless Function Entrypoint for FastAPI Application.
Routes incoming /api/* requests to the PayNova backend.
"""

import os
import sys

# Ensure root directory is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.main import app

# Vercel WSGI / ASGI handler
app = app
