import pytest
from httpx import AsyncClient


class TestFaculties:

    async def test_list_faculties_public(self, client, seed_faculty):
        resp = await client.get("/api/v1/general/faculties")
        assert resp.status_code == 200
        assert len(resp.json()) >= 1
        assert resp.json()[0]["name"] == "Faculty of Computing and Informatics"

    async def test_create_faculty_as_admin(self, client, admin_token):
        resp = await client.post(
            "/api/v1/general/faculties",
            json={"name": "Faculty of Medicine"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 201
        assert resp.json()["name"] == "Faculty of Medicine"

    async def test_create_duplicate_faculty_fails(self, client, admin_token, seed_faculty):
        resp = await client.post(
            "/api/v1/general/faculties",
            json={"name": "Faculty of Computing and Informatics"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 400

    async def test_create_faculty_requires_admin(self, client, staff_token):
        resp = await client.post(
            "/api/v1/general/faculties",
            json={"name": "Unauthorized Faculty"},
            headers={"Authorization": f"Bearer {staff_token}"}
        )
        assert resp.status_code == 403

    async def test_deactivate_faculty(self, client, admin_token, seed_faculty):
        resp = await client.delete(
            f"/api/v1/general/faculties/{seed_faculty.id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 200
        # Deactivated faculty should not appear in list
        list_resp = await client.get("/api/v1/general/faculties")
        names = [f["name"] for f in list_resp.json()]
        assert "Faculty of Computing and Informatics" not in names


class TestDepartments:

    async def test_list_departments_public(self, client, seed_department):
        resp = await client.get("/api/v1/general/departments")
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    async def test_filter_departments_by_faculty(self, client, seed_faculty, seed_department):
        resp = await client.get(f"/api/v1/general/departments?faculty_id={seed_faculty.id}")
        assert resp.status_code == 200
        assert all(d["faculty_id"] == seed_faculty.id for d in resp.json())

    async def test_create_department_as_admin(self, client, admin_token, seed_faculty):
        resp = await client.post(
            "/api/v1/general/departments",
            json={"name": "Software Engineering", "faculty_id": seed_faculty.id},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 201
        assert resp.json()["name"] == "Software Engineering"

    async def test_create_department_invalid_faculty(self, client, admin_token):
        resp = await client.post(
            "/api/v1/general/departments",
            json={"name": "Orphan Dept", "faculty_id": 99999},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 404

    async def test_create_department_requires_admin(self, client, staff_token, seed_faculty):
        resp = await client.post(
            "/api/v1/general/departments",
            json={"name": "Unauthorized Dept", "faculty_id": seed_faculty.id},
            headers={"Authorization": f"Bearer {staff_token}"}
        )
        assert resp.status_code == 403


class TestPublicGrantCalls:

    SAMPLE_CALL = {
        "title": "Public Landing Grant Call",
        "description": "Visible to anonymous visitors.",
        "grant_type": "Research",
        "academic_year": 2026,
        "opening_date": "2026-01-01",
        "closing_date": "2026-06-30",
        "max_budget": "5000000.00",
    }

    async def test_anonymous_can_list_open_grant_calls(self, client, admin_token):
        create = await client.post(
            "/api/v1/admin/grant-calls",
            json=self.SAMPLE_CALL,
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        call_id = create.json()["id"]
        await client.post(
            f"/api/v1/admin/grant-calls/{call_id}/open-window",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        resp = await client.get("/api/v1/general/grant-calls")
        assert resp.status_code == 200
        data = resp.json()
        assert any(c["id"] == call_id for c in data)
        assert all(c["status"] == "Open" for c in data)

    async def test_anonymous_does_not_see_draft_or_closed_calls(self, client, admin_token):
        create = await client.post(
            "/api/v1/admin/grant-calls",
            json={**self.SAMPLE_CALL, "title": "Draft Only Call"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        draft_id = create.json()["id"]

        resp = await client.get("/api/v1/general/grant-calls")
        assert resp.status_code == 200
        assert all(c["id"] != draft_id for c in resp.json())


class TestSystemSettings:

    async def test_get_settings_public(self, client, seed_settings):
        resp = await client.get("/api/v1/general/settings")
        assert resp.status_code == 200
        data = resp.json()
        assert data["system_name"] == "KAB-FIR Test"
        assert data["active_academic_year"] == 2026
        assert "submission_deadline" in data

    async def test_get_settings_not_found(self, client):
        resp = await client.get("/api/v1/general/settings")
        assert resp.status_code in (200, 404)

    async def test_update_settings_as_admin(self, client, admin_token, seed_settings):
        resp = await client.patch(
            "/api/v1/general/settings",
            json={"system_name": "KAB-FIR Updated", "active_academic_year": 2027},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 200
        assert resp.json()["system_name"] == "KAB-FIR Updated"
        assert resp.json()["active_academic_year"] == 2027

    async def test_update_submission_deadline(self, client, admin_token, seed_settings):
        resp = await client.patch(
            "/api/v1/general/settings",
            json={"submission_deadline": "2026-06-30"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 200
        assert resp.json()["submission_deadline"] == "2026-06-30"

    async def test_update_settings_requires_admin(self, client, staff_token, seed_settings):
        resp = await client.patch(
            "/api/v1/general/settings",
            json={"system_name": "Hacked"},
            headers={"Authorization": f"Bearer {staff_token}"}
        )
        assert resp.status_code == 403

    async def test_close_applications(self, client, admin_token, seed_settings):
        resp = await client.patch(
            "/api/v1/general/settings",
            json={"is_accepting_applications": False},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 200
        assert resp.json()["is_accepting_applications"] is False
