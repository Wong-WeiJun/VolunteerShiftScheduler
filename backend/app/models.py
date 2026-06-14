import uuid
from datetime import datetime, timezone

from pydantic import EmailStr
from sqlalchemy import DateTime, Date
from sqlmodel import Field, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


class OrgBase(SQLModel):
    name: str = Field(min_length=1, max_length=128)
    admin_email: EmailStr = Field(max_length=255)


class Org(OrgBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    slug: str = Field(unique=True, index=True, max_length=160)
    admin_token: str = Field(unique=True, index=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class ShiftBase(SQLModel):
    title: str = Field(min_length=8, max_length=128)
    date: Date
    start_time: DateTime
    end_time: DateTime
    location: str = Field(max_length=128)
    capacity: int


class Shift(ShiftBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class SignUpBase(SQLModel):
    name: str = Field(max_length=64)
    email: EmailStr = Field(max_length=255)


class SignUp(SignUpBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    shift_id: uuid.UUID = Field(foreign_key="shift.id")
    created_at: datetime | None = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
