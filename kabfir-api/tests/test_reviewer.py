
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.models.models import Proposal, ProposalStatus, ReviewAssignment



SAMPLE_PROPOSAL = {
    "grant_type": "Research", "pi_first_name": "Alice", "pi_last_name": "Nakato",
    "pi_qualification": "PhD", "pi_gender": "Female", "pi_designation": "Lecturer",
    "pi_department": "CS", "pi_research_specialization": "ML",
    "pi_email": "alice@kab.ac.ug", "pi_phone": "+256700000000",
    "research_type": "Applied", "title": "Reviewer Test Proposal",
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





async def _setup_assigned_proposal(client, db, staff_token, admin_token,
                                    seed_faculty, reviewer_user):
    """Helper: create a proposal, force submitted, assign reviewer."""
    payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id}
    r = await client.post("/api/v1/proposals", json=payload,
                          headers={"Authorization": f"Bearer {staff_token}"})
    pid = r.json()["id"]

    from datetime import datetime, timezone
    result = await db.execute(select(Proposal).where(Proposal.id == pid))
    p = result.scalar_one()
    p.status = ProposalStatus.submitted
    p.submitted_at = datetime.now(timezone.utc)
    await db.commit()

    _, reviewer = reviewer_user
    await client.post(
        f"/api/v1/admin/proposals/{pid}/assign-reviewers",
        json={"reviewer_ids": [reviewer.id]},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    return pid


class TestReviewerProposalAccess:

    async def test_reviewer_sees_assigned_proposals(self, client, db, staff_token,
                                                      admin_token, reviewer_token,
                                                      staff_user, seed_faculty,
                                                      seed_settings, reviewer_user):
        await _setup_assigned_proposal(client, db, staff_token, admin_token,
                                       seed_faculty, reviewer_user)
        resp = await client.get("/api/v1/reviewer/proposals",
                                headers={"Authorization": f"Bearer {reviewer_token}"})
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    async def test_reviewer_sees_empty_list_when_none_assigned(self, client, reviewer_token,
                                                                 reviewer_user):
        resp = await client.get("/api/v1/reviewer/proposals",
                                headers={"Authorization": f"Bearer {reviewer_token}"})
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_reviewer_gets_single_assigned_proposal(self, client, db, staff_token,
                                                            admin_token, reviewer_token,
                                                            staff_user, seed_faculty,
                                                            seed_settings, reviewer_user):
        pid = await _setup_assigned_proposal(client, db, staff_token, admin_token,
                                             seed_faculty, reviewer_user)
        resp = await client.get(f"/api/v1/reviewer/proposals/{pid}",
                                headers={"Authorization": f"Bearer {reviewer_token}"})
        assert resp.status_code == 200
        assert resp.json()["id"] == pid

    async def test_reviewer_cannot_access_unassigned_proposal(self, client, db, staff_token,
                                                                reviewer_token, staff_user,
                                                                seed_faculty, seed_settings):
        payload = {**SAMPLE_PROPOSAL, "pi_faculty_id": seed_faculty.id,
                   "title": "Unassigned Proposal"}
        r = await client.post("/api/v1/proposals", json=payload,
                              headers={"Authorization": f"Bearer {staff_token}"})
        pid = r.json()["id"]
        resp = await client.get(f"/api/v1/reviewer/proposals/{pid}",
                                headers={"Authorization": f"Bearer {reviewer_token}"})
        assert resp.status_code == 403

    async def test_staff_cannot_access_reviewer_routes(self, client, staff_token):
        resp = await client.get("/api/v1/reviewer/proposals",
                                headers={"Authorization": f"Bearer {staff_token}"})
        assert resp.status_code == 403

    async def test_admin_cannot_access_reviewer_routes(self, client, admin_token):
        resp = await client.get("/api/v1/reviewer/proposals",
                                headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 403


class TestSubmitReview:

    async def test_submit_review_text_only(self, client, db, staff_token, admin_token,
                                            reviewer_token, staff_user, seed_faculty,
                                            seed_settings, reviewer_user):
        pid = await _setup_assigned_proposal(client, db, staff_token, admin_token,
                                             seed_faculty, reviewer_user)
        resp = await client.post(
            f"/api/v1/reviewer/proposals/{pid}/review",
            data={"recommendation": "Approve", "comments": "Well-written proposal."},
            headers={"Authorization": f"Bearer {reviewer_token}"}
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["recommendation"] == "Approve"
        assert data["comments"] == "Well-written proposal."

    async def test_submit_review_with_file(self, client, db, staff_token, admin_token,
                                            reviewer_token, staff_user, seed_faculty,
                                            seed_settings, reviewer_user):
        import io
        pid = await _setup_assigned_proposal(client, db, staff_token, admin_token,
                                             seed_faculty, reviewer_user)
        resp = await client.post(
            f"/api/v1/reviewer/proposals/{pid}/review",
            data={"recommendation": "Minor Revisions", "comments": "Minor changes needed."},
            files={"report_file": ("review.pdf", io.BytesIO(b"%PDF fake"), "application/pdf")},
            headers={"Authorization": f"Bearer {reviewer_token}"}
        )
        assert resp.status_code == 201
        assert resp.json()["report_file_url"] is not None

    async def test_cannot_submit_review_twice(self, client, db, staff_token, admin_token,
                                               reviewer_token, staff_user, seed_faculty,
                                               seed_settings, reviewer_user):
        pid = await _setup_assigned_proposal(client, db, staff_token, admin_token,
                                             seed_faculty, reviewer_user)
        await client.post(
            f"/api/v1/reviewer/proposals/{pid}/review",
            data={"recommendation": "Approve"},
            headers={"Authorization": f"Bearer {reviewer_token}"}
        )
        resp = await client.post(
            f"/api/v1/reviewer/proposals/{pid}/review",
            data={"recommendation": "Reject"},
            headers={"Authorization": f"Bearer {reviewer_token}"}
        )
        assert resp.status_code == 400
        assert "already submitted" in resp.json()["detail"]

    async def test_invalid_recommendation_rejected(self, client, db, staff_token, admin_token,
                                                     reviewer_token, staff_user, seed_faculty,
                                                     seed_settings, reviewer_user):
        pid = await _setup_assigned_proposal(client, db, staff_token, admin_token,
                                             seed_faculty, reviewer_user)
        resp = await client.post(
            f"/api/v1/reviewer/proposals/{pid}/review",
            data={"recommendation": "Maybe"},
            headers={"Authorization": f"Bearer {reviewer_token}"}
        )
        assert resp.status_code == 400

    async def test_proposal_moves_to_reviewed_after_all_submit(self, client, db, staff_token,
                                                                  admin_token, reviewer_token,
                                                                  staff_user, seed_faculty,
                                                                  seed_settings, reviewer_user):
        pid = await _setup_assigned_proposal(client, db, staff_token, admin_token,
                                             seed_faculty, reviewer_user)
        await client.post(
            f"/api/v1/reviewer/proposals/{pid}/review",
            data={"recommendation": "Approve", "comments": "Looks good."},
            headers={"Authorization": f"Bearer {reviewer_token}"}
        )
        # Verify status moved to Reviewed
        result = await db.execute(select(Proposal).where(Proposal.id == pid))
        p = result.scalar_one()
        assert p.status == ProposalStatus.reviewed

    async def test_get_my_reviews(self, client, db, staff_token, admin_token,
                                   reviewer_token, staff_user, seed_faculty,
                                   seed_settings, reviewer_user):
        pid = await _setup_assigned_proposal(client, db, staff_token, admin_token,
                                             seed_faculty, reviewer_user)
        await client.post(
            f"/api/v1/reviewer/proposals/{pid}/review",
            data={"recommendation": "Reject", "comments": "Insufficient data."},
            headers={"Authorization": f"Bearer {reviewer_token}"}
        )
        resp = await client.get("/api/v1/reviewer/my-reviews",
                                headers={"Authorization": f"Bearer {reviewer_token}"})
        assert resp.status_code == 200
        assert len(resp.json()) == 1
        assert resp.json()[0]["recommendation"] == "Reject"
