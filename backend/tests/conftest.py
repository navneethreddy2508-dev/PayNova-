"""
Pytest fixtures for AI Order Return-Risk Scorer API tests.
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.main import app
from backend.database import SessionLocal, engine, Base
from backend.seed import seed_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Seed the database once for test sessions."""
    seed_database()
    yield

@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def db_session():
    """Database session fixture."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
