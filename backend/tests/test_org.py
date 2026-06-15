"""Tests for the org.py router."""

from datetime import date, time

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Org, Shift, SignUp


# ────────────────────────────────────────────────────────────────
# POST /orgs/ — createOrg
# ────────────────────────────────────────────────────────────────

class TestCreateOrg:
    async def test_create_org_success(self, async_client):
        payload = {"orgName": "Volunteer Group", "email": "admin@example.com"}
        resp = await async_client.post("/orgs/", json=payload)

        assert resp.status_code == 201
        body = resp.json()
        assert body["slug"] is not None
        assert body["adminToken"] is not None

    async def test_create_org_missing_name(self, async_client):
        payload = {"email": "admin@example.com"}
        resp = await async_client.post("/orgs/", json=payload)
        assert resp.status_code == 422

    async def test_create_org_invalid_email(self, async_client):
        payload = {"orgName": "Volunteer Group", "email": "not-an-email"}
        resp = await async_client.post("/orgs/", json=payload)
        assert resp.status_code == 422


# ────────────────────────────────────────────────────────────────
# GET /orgs/{slug} — getShifts
# ────────────────────────────────────────────────────────────────

class TestGetOrgDashboard:
    async def test_get_org_with_no_shifts(self, async_client, sample_org: Org):
        resp = await async_client.get(f"/orgs/{sample_org.slug}")
        assert resp.status_code == 200

        body = resp.json()
        assert body["id"] == str(sample_org.id)
        assert body["name"] == sample_org.name
        assert body["slug"] == sample_org.slug
        assert body["shifts"] == []

    async def test_get_org_with_shifts(self, async_client, db_session: AsyncSession, sample_org: Org):
        shift = Shift(
            org_id=sample_org.id,
            title="Community Cleanup Drive",
            date=date(2026, 6, 14),
            start_time=time(9, 0),
            end_time=time(12, 0),
            location="Town Park",
            capacity=5,
            notes="Bring gloves",
        )
        db_session.add(shift)
        await db_session.commit()
        await db_session.refresh(shift)

        resp = await async_client.get(f"/orgs/{sample_org.slug}")
        assert resp.status_code == 200

        body = resp.json()
        assert len(body["shifts"]) == 1
        shift_body = body["shifts"][0]
        assert shift_body["title"] == "Community Cleanup Drive"
        assert shift_body["signupCount"] == 0

    async def test_get_org_not_found(self, async_client):
        resp = await async_client.get("/orgs/nonexistent-slug")
        assert resp.status_code == 404


# ────────────────────────────────────────────────────────────────
# POST /orgs/{slug}/shifts — createShift
# ────────────────────────────────────────────────────────────────

class TestCreateShift:
    async def test_create_shift_success(self, async_client, sample_org: Org):
        payload = {
            "title": "Beach Cleanup Day",
            "date": "2026-06-14",
            "startTime": "09:00:00",
            "endTime": "12:00:00",
            "location": "Ocean Beach",
            "capacity": 10,
            "notes": "Bring sunscreen",
        }
        resp = await async_client.post(f"/orgs/{sample_org.slug}/shifts", json=payload)
        assert resp.status_code == 200

        body = resp.json()
        assert body["title"] == "Beach Cleanup Day"
        assert body["location"] == "Ocean Beach"
        assert body["signupCount"] == 0

    async def test_create_shift_org_not_found(self, async_client):
        payload = {
            "title": "Beach Cleanup Day",
            "date": "2026-06-14",
            "startTime": "09:00:00",
            "endTime": "12:00:00",
            "location": "Ocean Beach",
            "capacity": 10,
            "notes": "",
        }
        resp = await async_client.post("/orgs/nonexistent-slug/shifts", json=payload)
        assert resp.status_code == 404


# ────────────────────────────────────────────────────────────────
# GET /orgs/{slug}/shifts/{shift_id} — getShiftDetail
# ────────────────────────────────────────────────────────────────

class TestGetShiftDetail:
    async def test_get_shift_detail(self, async_client, db_session: AsyncSession, sample_org: Org):
        shift = Shift(
            org_id=sample_org.id,
            title="Food Bank Shift",
            date=date(2026, 6, 14),
            start_time=time(10, 0),
            end_time=time(14, 0),
            location="Food Bank HQ",
            capacity=3,
        )
        db_session.add(shift)
        await db_session.commit()
        await db_session.refresh(shift)

        resp = await async_client.get(f"/orgs/{sample_org.slug}/shifts/{shift.id}")
        assert resp.status_code == 200

        body = resp.json()
        assert body["id"] == str(shift.id)
        assert body["title"] == "Food Bank Shift"
        assert body["signupCount"] == 0

    async def test_get_shift_detail_not_found(self, async_client, sample_org: Org):
        resp = await async_client.get(f"/orgs/{sample_org.slug}/shifts/nonexistent-uuid")
        assert resp.status_code == 422  # UUID validation fails

    async def test_get_shift_detail_wrong_org(self, async_client, db_session: AsyncSession, sample_org: Org):
        # Second org with no shift
        import secrets
        other_org = Org(
            name="Other Org",
            admin_email="other@example.com",
            slug=f"other-org-{secrets.token_hex(3)}",
            admin_token="other-token",
        )
        db_session.add(other_org)
        await db_session.commit()
        await db_session.refresh(other_org)

        shift = Shift(
            org_id=other_org.id,
            title="Other Shift",
            date=date(2026, 6, 14),
            start_time=time(9, 0),
            end_time=time(12, 0),
            location="Other Place",
            capacity=5,
        )
        db_session.add(shift)
        await db_session.commit()
        await db_session.refresh(shift)

        # Try to access shift via a different org slug
        resp = await async_client.get(f"/orgs/{sample_org.slug}/shifts/{shift.id}")
        assert resp.status_code == 404


# ────────────────────────────────────────────────────────────────
# POST /orgs/{slug}/shifts/{shift_id}/signup — signupForShift
# ────────────────────────────────────────────────────────────────

class TestSignUpForShift:
    async def test_signup_success(self, async_client, db_session: AsyncSession, sample_org: Org):
        shift = Shift(
            org_id=sample_org.id,
            title="Helper Shift",
            date=date(2026, 6, 14),
            start_time=time(9, 0),
            end_time=time(11, 0),
            location="Community Center",
            capacity=2,
        )
        db_session.add(shift)
        await db_session.commit()
        await db_session.refresh(shift)

        payload = {"name": "Alice Example", "email": "alice@example.com"}
        resp = await async_client.post(
            f"/orgs/{sample_org.slug}/shifts/{shift.id}/signup",
            json=payload,
        )
        assert resp.status_code == 200

        body = resp.json()
        assert body["name"] == "Alice Example"
        assert body["email"] == "alice@example.com"
        assert body["shiftId"] == str(shift.id)

    async def test_signup_shift_full(self, async_client, db_session: AsyncSession, sample_org: Org):
        shift = Shift(
            org_id=sample_org.id,
            title="Tiny Shift",
            date=date(2026, 6, 14),
            start_time=time(9, 0),
            end_time=time(10, 0),
            location="Small Room",
            capacity=1,
        )
        db_session.add(shift)
        await db_session.commit()
        await db_session.refresh(shift)

        # Fill the shift
        signup = SignUp(shift_id=shift.id, name="First Person", email="first@example.com")
        db_session.add(signup)
        await db_session.commit()

        payload = {"name": "Second Person", "email": "second@example.com"}
        resp = await async_client.post(
            f"/orgs/{sample_org.slug}/shifts/{shift.id}/signup",
            json=payload,
        )
        assert resp.status_code == 409
        assert resp.json()["detail"] == "This shift is full"

    async def test_signup_shift_not_found(self, async_client, sample_org: Org):
        payload = {"name": "Alice", "email": "alice@example.com"}
        resp = await async_client.post(
            f"/orgs/{sample_org.slug}/shifts/nonexistent-uuid/signup",
            json=payload,
        )
        assert resp.status_code == 422  # UUID validation fails


# ────────────────────────────────────────────────────────────────
# GET /orgs/{slug}/signups — getOrgSignups (admin endpoint)
# ────────────────────────────────────────────────────────────────

class TestGetOrgSignups:
    async def test_get_signups_with_valid_token(self, async_client, db_session: AsyncSession, sample_org: Org):
        shift = Shift(
            org_id=sample_org.id,
            title="Admin Shift",
            date=date(2026, 6, 14),
            start_time=time(9, 0),
            end_time=time(12, 0),
            location="Admin Place",
            capacity=10,
        )
        db_session.add(shift)
        await db_session.commit()
        await db_session.refresh(shift)

        signup = SignUp(shift_id=shift.id, name="Volunteer One", email="v1@example.com")
        db_session.add(signup)
        await db_session.commit()

        resp = await async_client.get(
            f"/orgs/{sample_org.slug}/signups",
            headers={"Authorization": f"Bearer {sample_org.admin_token}"},
        )
        assert resp.status_code == 200

        body = resp.json()
        assert len(body) == 1
        assert body[0]["name"] == "Volunteer One"
        assert body[0]["shift"]["title"] == "Admin Shift"

    async def test_get_signups_missing_auth(self, async_client, sample_org: Org):
        resp = await async_client.get(f"/orgs/{sample_org.slug}/signups")
        assert resp.status_code == 401

    async def test_get_signups_invalid_token(self, async_client, sample_org: Org):
        resp = await async_client.get(
            f"/orgs/{sample_org.slug}/signups",
            headers={"Authorization": "Bearer wrong-token"},
        )
        assert resp.status_code == 403

    async def test_get_signups_wrong_token_format(self, async_client, sample_org: Org):
        resp = await async_client.get(
            f"/orgs/{sample_org.slug}/signups",
            headers={"Authorization": "Basic wrong-format"},
        )
        assert resp.status_code == 401
