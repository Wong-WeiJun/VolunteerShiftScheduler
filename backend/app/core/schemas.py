from sqlmodel import Field
from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from datetime import date, time, datetime
from typing import List
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class OrgCreate(CamelModel):
    org_name: str = Field(min_length=1, max_length=128)
    email: EmailStr = Field(min_length=1, max_length=255)


class OrgResponse(CamelModel):
    slug: str = Field(max_length=160)
    admin_token: str


class ShiftResponse(CamelModel):
    id: UUID
    title: str
    date: date
    start_time: time
    end_time: time
    location: str
    capacity: int
    notes: str | None
    signup_count: int


class OrgDashboardResponse(CamelModel):
    id: UUID
    name: str
    slug: str
    shifts: List[ShiftResponse]


class ShiftCreate(CamelModel):
    title: str
    date: date
    start_time: time
    end_time: time
    location: str
    capacity: int
    notes: str


class SignUpDetail(CamelModel):
    id: UUID
    name: str
    email: EmailStr


class ShiftDetailResponse(CamelModel):
    id: UUID
    org_id: UUID
    title: str
    date: date
    start_time: time
    end_time: time
    location: str
    capacity: int
    notes: str | None
    signup_count: int


class SignUpCreate(CamelModel):
    name: str = Field(min_length=1, max_length=64)
    email: EmailStr


class SignUpResponse(CamelModel):
    id: UUID
    name: str
    email: EmailStr
    shift_id: UUID
    created_at: datetime


class AdminSignUpResponse(CamelModel):
    id: UUID
    name: str
    email: EmailStr
    created_at: datetime
    shift: "ShiftSummary"


class ShiftSummary(CamelModel):
    id: UUID
    title: str
