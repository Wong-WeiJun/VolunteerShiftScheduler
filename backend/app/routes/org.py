from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from app.core.config import settings
from typing import Any, Annotated
from app.models import Org, Shift, SignUp
from app.core.schemas import (
    OrgCreate,
    OrgResponse,
    OrgDashboardResponse,
    ShiftResponse,
    ShiftCreate,
)
from app.core.database import get_db
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
import re
import secrets

router = APIRouter(prefix="/orgs", tags=["orgs"])


def generate_admin_token() -> str:
    return secrets.token_hex(32)


def generate_slug(name: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    suffix = secrets.token_hex(3)
    return f"{base}-{suffix}"


@router.post("/", response_model=OrgResponse, status_code=status.HTTP_201_CREATED)
async def createOrg(
    payload: OrgCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> OrgResponse:

    new_org = Org(
        name=payload.org_name,
        admin_email=payload.email,
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
            detail="Slug collision, please try again.",
        )

    await db.refresh(new_org)

    return OrgResponse.model_validate(new_org)


@router.get("/{slug}", response_model=OrgDashboardResponse)
async def getShifts(slug: str, db: Annotated[AsyncSession, Depends(get_db)]) -> Any:
    statement = (
        select(Org, Shift, func.count(SignUp.id).label("signup_count"))
        .join(Shift, Org.id == Shift.org_id, isouter=True)
        .join(SignUp, Shift.id == SignUp.shift_id, isouter=True)
        .where(Org.slug == slug)
        .group_by(Org.id, Shift.id)
    )
    result = await db.execute(statement)
    rows = result.all()

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found"
        )

    first_org = rows[0][0]
    shifts_list = [
        ShiftResponse(
            id=shift.id,
            title=shift.title,
            date=shift.date,
            start_time=shift.start_time,
            end_time=shift.end_time,
            location=shift.location,
            capacity=shift.capacity,
            notes=shift.notes,
            signup_count=signup_count,
        )
        for _, shift, signup_count in rows
        if shift is not None
    ]

    return OrgDashboardResponse(
        id=first_org.id, name=first_org.name, slug=first_org.slug, shifts=shifts_list
    )


@router.post("/{slug}/shifts", response_model=ShiftResponse)
async def createShift(
    slug: str, payload: ShiftCreate, db: Annotated[AsyncSession, Depends(get_db)]
) -> ShiftResponse:
    statement = select(Org.id).where(Org.slug == slug)

    result = await db.execute(statement)
    org_id = result.scalar_one_or_none()
    if not org_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found"
        )

    new_shift = Shift(
        org_id=org_id,
        title=payload.title,
        date=payload.date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        location=payload.location,
        capacity=payload.capacity,
        notes=payload.notes,
    )

    db.add(new_shift)

    await db.commit()

    await db.refresh(new_shift)
    return ShiftResponse(
        id=new_shift.id,
        title=new_shift.title,
        date=new_shift.date,
        start_time=new_shift.start_time,
        end_time=new_shift.end_time,
        location=new_shift.location,
        capacity=new_shift.capacity,
        notes=new_shift.notes,
        signup_count=0,
    )
