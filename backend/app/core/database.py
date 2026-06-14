from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings
from fastapi import Header, HTTPException, status, Depends
from sqlalchemy import select
from typing import Annotated
from app.models import Org

engine = create_async_engine(str(settings.SQLALCHEMY_DATABASE_URI))

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def get_org_from_token(
    slug: str,
    authorization: Annotated[str | None, Header()] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,
) -> Org:
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid token"
        )

    token = authorization.removeprefix("Bearer ")

    statement = select(Org).where(Org.slug == slug, Org.admin_token == token)
    result = await db.execute(statement)
    org = result.scalar_one_or_none()

    if org is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid token for this organization",
        )

    return org
