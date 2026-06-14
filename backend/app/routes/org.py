from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from app.core.config import settings
from typing import Any, Annotated
from app.models import Org, OrgBase
import app.models as models
from sqlmodel import SQLModel, Field
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
import re
import secrets

router = APIRouter(prefix="/orgs", tags=["orgs"])

class OrgCreate(BaseModel):
    org_name: str = Field(min_length=1, max_length=128)
    email: EmailStr = Field(min_length=1, max_length=255)

class OrgResponse(BaseModel):
    slug: str = Field(max_length=160)
    admin_token: str

    class Config:
        from_attributes = True


def generate_admin_token() -> str:
    return secrets.token_hex(32)


def generate_slug(name: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    suffix = secrets.token_hex(3)
    return f"{base}-{suffix}"


@router.post("/", response_model=OrgResponse, status_code=status.HTTP_201_CREATED)
async def createOrg(
    payload: OrgCreate, # <-- FastAPI automatically extracts the JSON body here
    db: Annotated[AsyncSession, Depends(get_db)],
) -> OrgResponse:
    
    new_org = models.Org(
        name=payload.org_name,       # Access data via payload object
        admin_email=payload.email,   # Access data via payload object
        slug=generate_slug(payload.org_name),
        admin_token=generate_admin_token(),
    )
    
    db.add(new_org)
    
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, 
            detail="Slug collision, please try again."
        )
        
    await db.refresh(new_org)
    
    return OrgResponse.model_validate(new_org)

@router.get("/{slug}")
async def getShifts():

