from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.deps import get_current_reviewer
from app.models.models import (
    User, Reviewer, ReviewAssignment, ReviewerReport,
    Proposal, ProposalStatus, ProposalStatusHistory
)
from app.schemas.schemas import (
    ProposalDetailResponse, ReviewerReportResponse,
    SubmitReviewRequest, MessageResponse
)
from app.utils.file_storage import upload_file, delete_file

router = APIRouter(prefix="/reviewer", tags=["Reviewer"])


async def _get_reviewer_profile(user: User, db: AsyncSession) -> Reviewer:
    result = await db.execute(
        select(Reviewer).where(Reviewer.user_id == user.id)
    )
    reviewer = result.scalar_one_or_none()
    if not reviewer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reviewer profile not found.",
        )
    return reviewer


# ─────────────────────────────────────────
# GET ASSIGNED PROPOSALS
# ─────────────────────────────────────────

@router.get("/proposals", response_model=List[ProposalDetailResponse])
async def get_assigned_proposals(
    current_user: User = Depends(get_current_reviewer),
    db: AsyncSession = Depends(get_db),
):
    """Get all proposals assigned to the logged-in reviewer."""
    reviewer = await _get_reviewer_profile(current_user, db)

    result = await db.execute(
        select(Proposal)
        .join(ReviewAssignment, ReviewAssignment.proposal_id == Proposal.id)
        .where(ReviewAssignment.reviewer_id == reviewer.id)
        .options(
            selectinload(Proposal.attachments),
            selectinload(Proposal.team_members),
            selectinload(Proposal.status_history),
        )
        .order_by(ReviewAssignment.assigned_at.desc())
    )
    return result.scalars().all()


# ─────────────────────────────────────────
# GET SINGLE ASSIGNED PROPOSAL
# ─────────────────────────────────────────

@router.get("/proposals/{proposal_id}", response_model=ProposalDetailResponse)
async def get_assigned_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_reviewer),
    db: AsyncSession = Depends(get_db),
):
    """Get full details of a single assigned proposal."""
    reviewer = await _get_reviewer_profile(current_user, db)

    # Verify this proposal is actually assigned to this reviewer
    assignment_result = await db.execute(
        select(ReviewAssignment).where(
            ReviewAssignment.proposal_id == proposal_id,
            ReviewAssignment.reviewer_id == reviewer.id,
        )
    )
    if not assignment_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This proposal is not assigned to you.",
        )

    result = await db.execute(
        select(Proposal)
        .where(Proposal.id == proposal_id)
        .options(
            selectinload(Proposal.attachments),
            selectinload(Proposal.team_members),
            selectinload(Proposal.status_history),
        )
    )
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found.")
    return proposal


# ─────────────────────────────────────────
# SUBMIT REVIEW
# ─────────────────────────────────────────

@router.post("/proposals/{proposal_id}/review", response_model=ReviewerReportResponse, status_code=status.HTTP_201_CREATED)
async def submit_review(
    proposal_id: int,
    recommendation: str = Form(...),
    score: int = Form(None),
    comments: str = Form(None),
    report_file: UploadFile = File(None),
    current_user: User = Depends(get_current_reviewer),
    db: AsyncSession = Depends(get_db),
):
    """Submit a review report for an assigned proposal."""
    from app.models.models import ReviewRecommendation
    reviewer = await _get_reviewer_profile(current_user, db)

    # Get the assignment
    assignment_result = await db.execute(
        select(ReviewAssignment).where(
            ReviewAssignment.proposal_id == proposal_id,
            ReviewAssignment.reviewer_id == reviewer.id,
        )
    )
    assignment = assignment_result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This proposal is not assigned to you.",
        )

    if assignment.review_status == "Submitted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a review for this proposal.",
        )

    # Validate recommendation value
    try:
        rec_enum = ReviewRecommendation(recommendation)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid recommendation. Choose from: {[r.value for r in ReviewRecommendation]}",
        )

    # Handle optional file upload
    file_url = None
    file_public_id = None
    if report_file and report_file.filename:
        upload_result = await upload_file(report_file, folder=f"kabfir/reviews/{proposal_id}")
        file_url = upload_result["url"]
        file_public_id = upload_result["public_id"]

    # Validate score range if provided
    if score is not None and not (1 <= score <= 10):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="score must be an integer between 1 and 10.",
        )

    report = ReviewerReport(
        assignment_id=assignment.id,
        proposal_id=proposal_id,
        reviewer_id=reviewer.id,
        recommendation=rec_enum,
        score=score,
        comments=comments,
        report_file_url=file_url,
        report_file_public_id=file_public_id,
    )
    db.add(report)

    # Mark assignment as submitted
    assignment.review_status = "Submitted"

    # Check if ALL reviewers for this proposal have submitted
    # If yes, move proposal to Reviewed
    await db.flush()
    await _check_all_reviews_done(proposal_id, db, current_user.id)

    await db.commit()
    await db.refresh(report)
    return report


async def _check_all_reviews_done(proposal_id: int, db: AsyncSession, changed_by_id: int):
    """Move proposal to Reviewed if all assigned reviewers have submitted."""
    assignments_result = await db.execute(
        select(ReviewAssignment).where(ReviewAssignment.proposal_id == proposal_id)
    )
    assignments = assignments_result.scalars().all()

    all_submitted = all(a.review_status == "Submitted" for a in assignments)

    if all_submitted and len(assignments) > 0:
        proposal_result = await db.execute(
            select(Proposal).where(Proposal.id == proposal_id)
        )
        proposal = proposal_result.scalar_one()
        old_status = proposal.status.value
        proposal.status = ProposalStatus.reviewed

        history = ProposalStatusHistory(
            proposal_id=proposal_id,
            old_status=old_status,
            new_status=ProposalStatus.reviewed.value,
            changed_by=changed_by_id,
            note="All assigned reviewers have submitted their reports.",
        )
        db.add(history)


# ─────────────────────────────────────────
# GET MY SUBMITTED REVIEWS
# ─────────────────────────────────────────

@router.get("/my-reviews", response_model=List[ReviewerReportResponse])
async def get_my_reviews(
    current_user: User = Depends(get_current_reviewer),
    db: AsyncSession = Depends(get_db),
):
    """Get all reviews submitted by the logged-in reviewer."""
    reviewer = await _get_reviewer_profile(current_user, db)

    result = await db.execute(
        select(ReviewerReport)
        .where(ReviewerReport.reviewer_id == reviewer.id)
        .order_by(ReviewerReport.submitted_at.desc())
    )
    return result.scalars().all()
