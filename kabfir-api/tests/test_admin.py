import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.models.models import Proposal, ProposalStatus, ReviewAssignment



SAMPLE_PROPOSAL = {
    "grant_type": "Research", "pi_first_name": "Alice", "pi_last_name": "Nakato",
    "pi_qualification": "PhD", "pi_gender": "Female", "pi_designation": "Lecturer",
    "pi_department": "CS", "pi_research_specialization": "ML",
    "pi_email": "alice@kab.ac.ug", "pi_phone": "+256700000000",
    "research_type": "Applied", "title": "Test Proposal",
    "project_summary": "Summary", "problem_statement": "Problem",
    "proposed_solution": "Solution", "relevance": "Relevant",
    "innovativeness": "Innovative", "main_objective": "Objective",
    "specific_objectives": "1. Do this", "methods_description": "Methods",
    "outcomes": "Outcomes", "dissemination_plan": "Disseminate",
    "policy_impact": "Policy", "scalability": "Scalable",
    "sustainability": "Sustainable", "gender_considerations": "Gender",
    "ethical_impact": "Ethical", "capacity_building": "Capacity",
    "conflict_of_interest": "None", "references": "Ref 1",
    "total_budget": "10000000.00", "pi_faculty_id": None,
}


class TestAdminDashboard:

    async def test_dashboard_accessible_by_admin(self, client, admin_token):
        resp = await client.get("/api/v1/admin/dashboard",
                                headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "submitted" in data
        assert "reviewed" in data
        assert "approved" in data
        assert "total" in data

    async def test_dashboard_blocked_for_staff(self, client, staff_token):
        resp = await client.get("/api/v1/admin/dashboard",
                                headers={"Authorization": f"Bearer {staff_token}"})
        assert resp.status_code == 403

    async def test_dashboard_blocked_for_reviewer(self, client, reviewer_token):
        resp = await client.get("/api/v1/admin/dashboard",
                                headers={"Authorization": f"Bearer {reviewer_token}"})
        assert resp.status_code == 403


class TestUserManagement:

    async def test_list_users(self, client, admin_token, staff_user):
        resp = await client.get("/api/v1/admin/users",
                                headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
        assert len(resp.json()) >= 1

    async def test_deactivate_user(self, client, admin_token, staff_user):
        resp = await client.patch(f"/api/v1/admin/users/{staff_user.id}/deactivate",
                                  headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert "deactivated" in resp.json()["message"]

    async def test_activate_user(self, client, admin_token, staff_user, db):
        staff_user.is_active = False
        await db.commit()
        resp = await client.patch(f"/api/v1/admin/users/{staff_user.id}/activate",
                                  headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert "activated" in resp.json()["message"]

    async def test_deactivate_nonexistent_user(self, client, admin_token):
        resp = await client.patch("/api/v1/admin/users/99999/deactivate",
                                  headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 404


class TestReviewerManagement:

    async def test_create_reviewer_success(self, client, admin_token):
        resp = await client.post("/api/v1/admin/reviewers", json={
            "first_name": "Dr. Sarah", "surname": "Birungi",
            "gender": "Female", "email": "sarah.birungi@gmail.com",
            "research_discipline": "Public Health",
            "password": "reviewpass123", "confirm_password": "reviewpass123",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["user"]["email"] == "sarah.birungi@gmail.com"
        assert data["research_discipline"] == "Public Health"

    async def test_create_reviewer_duplicate_email(self, client, admin_token, reviewer_user):
        resp = await client.post("/api/v1/admin/reviewers", json={
            "first_name": "Bob2", "surname": "Mugisha",
            "gender": "Male", "email": "bob.mugisha@gmail.com",
            "password": "reviewpass123", "confirm_password": "reviewpass123",
        }, headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 400

    async def test_list_reviewers(self, client, admin_token, reviewer_user):
        resp = await client.get("/api/v1/admin/reviewers",
                                headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    async def test_delete_reviewer(self, client, admin_token, reviewer_user):
        _, reviewer = reviewer_user
        resp = await client.delete(f"/api/v1/admin/reviewers/{reviewer.id}",
                                   headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200


class TestProposalManagement:

    async def _submit_proposal(self, client, staff_token, seed_faculty, db):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
        r = await client.post("/api/v1/proposals", json=payload,
                              headers={"Authorization": f"Bearer {staff_token}"})
        pid = r.json()["id"]
        # Force to submitted
        result = await db.execute(select(Proposal).where(Proposal.id == pid))
        p = result.scalar_one()
        from datetime import datetime, timezone
        p.status = ProposalStatus.submitted
        p.submitted_at = datetime.now(timezone.utc)
        await db.commit()
        return pid

    async def test_get_submitted_proposals(self, client, admin_token, staff_token,
                                            staff_user, seed_faculty, seed_settings, db):
        await self._submit_proposal(client, staff_token, seed_faculty, db)
        resp = await client.get("/api/v1/admin/proposals/submitted",
                                headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    async def test_assign_reviewers_success(self, client, admin_token, staff_token,
                                             staff_user, seed_faculty, seed_settings,
                                             reviewer_user, db):
        pid = await self._submit_proposal(client, staff_token, seed_faculty, db)
        _, reviewer = reviewer_user

        resp = await client.post(
            f"/api/v1/admin/proposals/{pid}/assign-reviewers",
            json={"reviewer_ids": [reviewer.id]},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 200
        assert "assigned" in resp.json()["message"]

        # Verify status changed
        result = await db.execute(select(Proposal).where(Proposal.id == pid))
        p = result.scalar_one()
        assert p.status == ProposalStatus.scheduled_for_review

    async def test_assign_more_than_3_reviewers_fails(self, client, admin_token, staff_token,
                                                        staff_user, seed_faculty, seed_settings, db):
        pid = await self._submit_proposal(client, staff_token, seed_faculty, db)
        resp = await client.post(
            f"/api/v1/admin/proposals/{pid}/assign-reviewers",
            json={"reviewer_ids": [1, 2, 3, 4]},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 422

    async def test_assign_reviewer_to_non_submitted_fails(self, client, admin_token,
                                                           staff_token, staff_user,
                                                           seed_faculty, seed_settings,
                                                           reviewer_user, db):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
        r = await client.post("/api/v1/proposals", json=payload,
                              headers={"Authorization": f"Bearer {staff_token}"})
        pid = r.json()["id"]
        _, reviewer = reviewer_user

        resp = await client.post(
            f"/api/v1/admin/proposals/{pid}/assign-reviewers",
            json={"reviewer_ids": [reviewer.id]},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 400

    async def test_admin_decision_approved(self, client, admin_token, staff_token,
                                            staff_user, seed_faculty, seed_settings,
                                            reviewer_user, db):
        pid = await self._submit_proposal(client, staff_token, seed_faculty, db)
        # Force to reviewed
        result = await db.execute(select(Proposal).where(Proposal.id == pid))
        p = result.scalar_one()
        p.status = ProposalStatus.reviewed
        await db.commit()

        resp = await client.post(
            f"/api/v1/admin/proposals/{pid}/decision",
            json={"decision": "Approved", "note": "Excellent proposal."},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 200
        assert "Approved" in resp.json()["message"]

        result = await db.execute(select(Proposal).where(Proposal.id == pid))
        p = result.scalar_one()
        assert p.status == ProposalStatus.approved
        assert p.admin_decision == "Approved"

    async def test_admin_decision_rejected(self, client, admin_token, staff_token,
                                            staff_user, seed_faculty, seed_settings, db):
        pid = await self._submit_proposal(client, staff_token, seed_faculty, db)
        result = await db.execute(select(Proposal).where(Proposal.id == pid))
        p = result.scalar_one()
        p.status = ProposalStatus.reviewed
        await db.commit()

        resp = await client.post(
            f"/api/v1/admin/proposals/{pid}/decision",
            json={"decision": "Rejected", "note": "Does not meet criteria."},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 200
        result = await db.execute(select(Proposal).where(Proposal.id == pid))
        assert result.scalar_one().status == ProposalStatus.rejected

    async def test_decision_on_non_reviewed_proposal_fails(self, client, admin_token,
                                                             staff_token, staff_user,
                                                             seed_faculty, seed_settings, db):
        pid = await self._submit_proposal(client, staff_token, seed_faculty, db)
        resp = await client.post(
            f"/api/v1/admin/proposals/{pid}/decision",
            json={"decision": "Approved"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 400

    async def test_invalid_decision_value_fails(self, client, admin_token, staff_token,
                                                 staff_user, seed_faculty, seed_settings, db):
        pid = await self._submit_proposal(client, staff_token, seed_faculty, db)
        result = await db.execute(select(Proposal).where(Proposal.id == pid))
        p = result.scalar_one()
        p.status = ProposalStatus.reviewed
        await db.commit()

        resp = await client.post(
            f"/api/v1/admin/proposals/{pid}/decision",
            json={"decision": "Maybe"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert resp.status_code == 422


class TestAwardedProposals:

    async def test_get_awarded_proposals(self, client, admin_token, staff_token,
                                          staff_user, seed_faculty, seed_settings, db):
        # Create and force to awarded
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id,
                   "title": "Award Test Proposal"}
        r = await client.post("/api/v1/proposals", json=payload,
                              headers={"Authorization": f"Bearer {staff_token}"})
        pid = r.json()["id"]

        from datetime import datetime, timezone
        result = await db.execute(select(Proposal).where(Proposal.id == pid))
        p = result.scalar_one()
        p.status = ProposalStatus.reviewed
        await db.commit()

        # Make decision = Awarded
        await client.post(
            f"/api/v1/admin/proposals/{pid}/decision",
            json={"decision": "Awarded", "note": "Congratulations."},
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        resp = await client.get("/api/v1/admin/proposals/awarded",
                                headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        assert any(p["id"] == pid for p in resp.json())

    async def test_awarded_endpoint_blocked_for_staff(self, client, staff_token):
        resp = await client.get("/api/v1/admin/proposals/awarded",
                                headers={"Authorization": f"Bearer {staff_token}"})
        assert resp.status_code == 403
