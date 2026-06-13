import pytest
from unittest.mock import AsyncMock, patch


SAMPLE_CALL = {
    "title": "Interest Test Grant Call",
    "description": "Test call for interest submissions.",
    "grant_type": "Research",
    "academic_year": 2026,
    "opening_date": "2026-01-01",
    "closing_date": "2026-06-30",
    "max_budget": "1000000.00",
}


class TestGrantCallInterest:

    async def _open_call(self, client, admin_token):
        create = await client.post(
            "/api/v1/admin/grant-calls",
            json=SAMPLE_CALL,
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        call_id = create.json()["id"]
        await client.post(
            f"/api/v1/admin/grant-calls/{call_id}/open-window",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        return call_id

    async def test_staff_can_submit_interest_pdf(self, client, admin_token, staff_token):
        call_id = await self._open_call(client, admin_token)

        mock_upload = {
            "url": "https://res.cloudinary.com/demo/raw/upload/v1/test.pdf",
            "public_id": "kabfir/interests/test",
            "file_name": "interest.pdf",
        }

        with patch(
            "app.api.v1.endpoints.grant_interests.upload_pdf_file",
            new=AsyncMock(return_value=mock_upload),
        ):
            resp = await client.post(
                f"/api/v1/grant-calls/{call_id}/interests",
                files={"file": ("interest.pdf", b"%PDF-1.4 test", "application/pdf")},
                headers={"Authorization": f"Bearer {staff_token}"},
            )

        assert resp.status_code == 201
        data = resp.json()
        assert data["grant_call_id"] == call_id
        assert data["status"] == "Submitted"
        assert data["file_name"] == "interest.pdf"

    async def test_duplicate_interest_rejected(self, client, admin_token, staff_token):
        call_id = await self._open_call(client, admin_token)
        mock_upload = {
            "url": "https://res.cloudinary.com/demo/raw/upload/v1/test.pdf",
            "public_id": "kabfir/interests/test",
            "file_name": "interest.pdf",
        }

        with patch(
            "app.api.v1.endpoints.grant_interests.upload_pdf_file",
            new=AsyncMock(return_value=mock_upload),
        ):
            first = await client.post(
                f"/api/v1/grant-calls/{call_id}/interests",
                files={"file": ("interest.pdf", b"%PDF-1.4 test", "application/pdf")},
                headers={"Authorization": f"Bearer {staff_token}"},
            )
            assert first.status_code == 201

            second = await client.post(
                f"/api/v1/grant-calls/{call_id}/interests",
                files={"file": ("interest.pdf", b"%PDF-1.4 test", "application/pdf")},
                headers={"Authorization": f"Bearer {staff_token}"},
            )
            assert second.status_code == 400

    async def test_admin_can_list_interests(self, client, admin_token, staff_token):
        call_id = await self._open_call(client, admin_token)
        mock_upload = {
            "url": "https://res.cloudinary.com/demo/raw/upload/v1/test.pdf",
            "public_id": "kabfir/interests/test",
            "file_name": "interest.pdf",
        }

        with patch(
            "app.api.v1.endpoints.grant_interests.upload_pdf_file",
            new=AsyncMock(return_value=mock_upload),
        ):
            await client.post(
                f"/api/v1/grant-calls/{call_id}/interests",
                files={"file": ("interest.pdf", b"%PDF-1.4 test", "application/pdf")},
                headers={"Authorization": f"Bearer {staff_token}"},
            )

        resp = await client.get(
            f"/api/v1/admin/grant-calls/{call_id}/interests",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["email"]
        assert data[0]["document_url"]

    async def test_reviewer_cannot_submit_interest(self, client, admin_token, reviewer_token):
        call_id = await self._open_call(client, admin_token)
        resp = await client.post(
            f"/api/v1/grant-calls/{call_id}/interests",
            files={"file": ("interest.pdf", b"%PDF-1.4 test", "application/pdf")},
            headers={"Authorization": f"Bearer {reviewer_token}"},
        )
        assert resp.status_code == 403
