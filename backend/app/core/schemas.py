from sqlmodel import Field
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import date, time
from typing import List


class OrgCreate(BaseModel):
    org_name: str = Field(min_length=1, max_length=128)
    email: EmailStr = Field(min_length=1, max_length=255)


class OrgResponse(BaseModel):
    slug: str = Field(max_length=160)
    admin_token: str

    class Config:
        from_attributes = True


class ShiftResponse(BaseModel):
    id: UUID
    title: str
    date: date
    start_time: time
    end_time: time
    location: str
    capacity: int
    notes: str | None
    signup_count: int


class OrgDashboardResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    shifts: List[ShiftResponse]
