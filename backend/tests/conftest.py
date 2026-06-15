import sys
from pathlib import Path

# Ensure the backend directory is on the path so `app` imports work
# regardless of where pytest is invoked from.
_BACKEND_DIR = str(Path(__file__).resolve().parent.parent)
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

import os

# Prime required env vars before app.core.config is imported (it runs
# Pydantic validation at module load time).
os.environ.setdefault("PROJECT_NAME", "Test Project")
os.environ.setdefault("POSTGRES_SERVER", "localhost")
os.environ.setdefault("POSTGRES_USER", "test_user")
os.environ.setdefault("FIRST_SUPERUSER", "test@example.com")
os.environ.setdefault("FIRST_SUPERUSER_PASSWORD", "test_password_123")

import asyncio
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlmodel import SQLModel
from typing import AsyncGenerator

from app.main import app
from app.core.database import get_db
from app.models import Org, Shift, SignUp  # noqa: F401 -- ensures tables are registered

# Use in-memory SQLite for tests (async)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(scope="session")
async def _db_engine():
    """Create the database engine and tables once per test session."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(_db_engine) -> AsyncGenerator[AsyncSession, None]:
    """Provide a fresh database session per test, rolled back after completion."""
    connection = await _db_engine.connect()
    transaction = await connection.begin()
    session = AsyncSessionLocal(bind=connection)

    # Re-bind the dependency override to this session's connection
    # so each test gets an isolated transaction.
    async def _override() -> AsyncGenerator[AsyncSession, None]:
        yield session

    app.dependency_overrides[get_db] = _override

    yield session

    await session.close()
    await transaction.rollback()
    await connection.close()

    # Reset override to use the transactional session
    del app.dependency_overrides[get_db]


@pytest_asyncio.fixture
async def async_client(db_session) -> AsyncGenerator[AsyncClient, None]:
    """Provide an async HTTP client for endpoint tests."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture
async def sample_org(db_session: AsyncSession) -> Org:
    """Create a basic Org for use in other endpoint tests."""
    from app.models import Org
    import secrets

    org = Org(
        name="Test Organization",
        admin_email="test@example.com",
        slug=f"test-org-{secrets.token_hex(3)}",
        admin_token="test-admin-token-123",
    )
    db_session.add(org)
    await db_session.commit()
    await db_session.refresh(org)
    return org
