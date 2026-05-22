from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime, timedelta, timezone
from app.core.database import get_db
from app.core.deps import get_current_admin
from app.models.models import (
    User, UserRole, Reviewer, OTPToken, Proposal, ProposalStatus,
    ProposalStatusHistory, ReviewAssignment, ReviewerReport, SystemSetting
)
from app.schemas.schemas import (
    CreateReviewerRequest, ReviewerResponse, UserResponse,
    ProposalResponse, ProposalDetailResponse, AssignReviewerRequest,
    ReviewAssignmentResponse, AdminDecisionRequest, DashboardStatsResponse,
    MessageResponse
)
from app.utils.password import hash_password
from app.utils.helpers import generate_otp
from app.utils.email import (
    send_otp_email, send_reviewer_assignment_email, send_proposal_decision_email
)

router = APIRouter(prefix="/admin", tags=["Admin"])


# ─────────────────────────────────────────
# DASHBOARD STATS
# ─────────────────────────────────────────

@router.get("/dashboard", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin dashboard — proposal counts by status."""
    async def count_by_status(s: ProposalStatus) -> int:
        result = await db.execute(
            select(func.count()).where(Proposal.status == s)
        )
        return result.scalar_one()

    submitted = await count_by_status(ProposalStatus.submitted)
    scheduled = await count_by_status(ProposalStatus.scheduled_for_review)
    reviewed = await count_by_status(ProposalStatus.reviewed)
    approved = await count_by_status(ProposalStatus.approved)
    rejected = await count_by_status(ProposalStatus.rejected)
    awarded = await count_by_status(ProposalStatus.awarded)

    return DashboardStatsResponse(
        submitted=submitted,
        scheduled_for_review=scheduled,
        reviewed=reviewed,
        approved=approved,
        rejected=rejected,
        awarded=awarded,
        total=submitted + scheduled + reviewed + approved + rejected + awarded,
    )


# ─────────────────────────────────────────
# USER MANAGEMENT
# ─────────────────────────────────────────

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all staff/student users."""
    result = await db.execute(
        select(User)
        .where(User.role == UserRole.staff)
        .order_by(User.created_at.desc())
    )
    return result.scalars().all()


@router.patch("/users/{user_id}/deactivate", response_model=MessageResponse)
async def deactivate_user(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    user.is_active = False
    await db.commit()
    return MessageResponse(message=f"User {user.email} has been deactivated.")


@router.patch("/users/{user_id}/activate", response_model=MessageResponse)
async def activate_user(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    user.is_active = True
    await db.commit()
    return MessageResponse(message=f"User {user.email} has been activated.")


# ─────────────────────────────────────────
# REVIEWER MANAGEMENT
# ─────────────────────────────────────────

@router.post("/reviewers", response_model=ReviewerResponse, status_code=status.HTTP_201_CREATED)
async def create_reviewer(
    payload: CreateReviewerRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a reviewer account. Sends OTP to their email."""
    existing = await db.execute(select(User).where(User.email == str(payload.email)))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    user = User(
        first_name=payload.first_name,
        surname=payload.surname,
        gender=payload.gender,
        phone=payload.phone,
        email=str(payload.email),
        password_hash=hash_password(payload.password),
        role=UserRole.reviewer,
        is_active=True,
        must_change_password=True,
    )
    db.add(user)
    await db.flush()

    reviewer = Reviewer(
        user_id=user.id,
        research_discipline=payload.research_discipline,
        assigned_by=current_user.id,
    )
    db.add(reviewer)

    # Generate OTP for first login
    otp = generate_otp(6)
    expires = datetime.now(timezone.utc) + timedelta(hours=24)
    otp_token = OTPToken(
        user_id=user.id,
        otp_code=otp,
        expires_at=expires,
        used=False,
    )
    db.add(otp_token)
    await db.commit()
    await db.refresh(reviewer)

    full_name = f"{user.first_name} {user.surname}"
    background_tasks.add_task(send_otp_email, user.email, otp, full_name)

    # Reload with user relationship
    result = await db.execute(
        select(Reviewer)
        .where(Reviewer.id == reviewer.id)
        .options(selectinload(Reviewer.user))
    )
    return result.scalar_one()


@router.get("/reviewers", response_model=List[ReviewerResponse])
async def list_reviewers(
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Reviewer)
        .options(selectinload(Reviewer.user))
        .order_by(Reviewer.created_at.desc())
    )
    return result.scalars().all()


@router.delete("/reviewers/{reviewer_id}", response_model=MessageResponse)
async def delete_reviewer(
    reviewer_id: int,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Reviewer).where(Reviewer.id == reviewer_id))
    reviewer = result.scalar_one_or_none()
    if not reviewer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reviewer not found.")
    await db.delete(reviewer)
    await db.commit()
    return MessageResponse(message="Reviewer removed.")


# ─────────────────────────────────────────
# PROPOSAL MANAGEMENT
# ─────────────────────────────────────────

@router.get("/proposals/submitted", response_model=List[ProposalResponse])
async def get_submitted_proposals(
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Proposal)
        .where(Proposal.status == ProposalStatus.submitted)
        .options(selectinload(Proposal.attachments), selectinload(Proposal.team_members))
        .order_by(Proposal.submitted_at.desc())
    )
    return result.scalars().all()


@router.get("/proposals/scheduled", response_model=List[ProposalResponse])
async def get_scheduled_proposals(
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Proposal)
        .where(Proposal.status == ProposalStatus.scheduled_for_review)
        .options(
            selectinload(Proposal.attachments),
            selectinload(Proposal.review_assignments).selectinload(ReviewAssignment.reviewer).selectinload(Reviewer.user),
        )
        .order_by(Proposal.updated_at.desc())
    )
    return result.scalars().all()


@router.get("/proposals/reviewed", response_model=List[ProposalResponse])
async def get_reviewed_proposals(
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Proposal)
        .where(Proposal.status == ProposalStatus.reviewed)
        .options(selectinload(Proposal.attachments))
        .order_by(Proposal.updated_at.desc())
    )
    return result.scalars().all()


@router.get("/proposals/approved", response_model=List[ProposalResponse])
async def get_approved_proposals(
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Proposal)
        .where(Proposal.status == ProposalStatus.approved)
        .order_by(Proposal.admin_decision_at.desc())
    )
    return result.scalars().all()


@router.get("/proposals/rejected", response_model=List[ProposalResponse])
async def get_rejected_proposals(
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Proposal)
        .where(Proposal.status == ProposalStatus.rejected)
        .order_by(Proposal.admin_decision_at.desc())
    )
    return result.scalars().all()


@router.get("/proposals/{proposal_id}", response_model=ProposalDetailResponse)
async def get_proposal_detail(
    proposal_id: int,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Proposal)
        .where(Proposal.id == proposal_id)
        .options(
            selectinload(Proposal.attachments),
            selectinload(Proposal.team_members),
            selectinload(Proposal.status_history),
            selectinload(Proposal.review_assignments)
            .selectinload(ReviewAssignment.reviewer)
            .selectinload(Reviewer.user),
            selectinload(Proposal.review_assignments)
            .selectinload(ReviewAssignment.report),
        )
    )
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found.")
    return proposal


# ─────────────────────────────────────────
# ASSIGN REVIEWERS
# ─────────────────────────────────────────

@router.post("/proposals/{proposal_id}/assign-reviewers", response_model=MessageResponse)
async def assign_reviewers(
    proposal_id: int,
    payload: AssignReviewerRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Assign 1–3 reviewers to a submitted proposal."""
    result = await db.execute(select(Proposal).where(Proposal.id == proposal_id))
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found.")

    if proposal.status != ProposalStatus.submitted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only submitted proposals can be assigned for review.",
        )

    # Validate all reviewer IDs exist
    for rev_id in payload.reviewer_ids:
        rev_result = await db.execute(
            select(Reviewer)
            .where(Reviewer.id == rev_id)
            .options(selectinload(Reviewer.user))
        )
        reviewer = rev_result.scalar_one_or_none()
        if not reviewer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Reviewer with ID {rev_id} not found.",
            )

        # Check not already assigned
        existing = await db.execute(
            select(ReviewAssignment).where(
                ReviewAssignment.proposal_id == proposal_id,
                ReviewAssignment.reviewer_id == rev_id,
            )
        )
        if existing.scalar_one_or_none():
            continue  # skip already assigned

        assignment = ReviewAssignment(
            proposal_id=proposal_id,
            reviewer_id=rev_id,
            assigned_by=current_user.id,
            review_status="Pending",
        )
        db.add(assignment)

        # Notify reviewer
        background_tasks.add_task(
            send_reviewer_assignment_email,
            reviewer.user.email,
            f"{reviewer.user.first_name} {reviewer.user.surname}",
            proposal.title,
            proposal.protocol_no,
        )

    # Update proposal status
    old_status = proposal.status.value
    proposal.status = ProposalStatus.scheduled_for_review
    history = ProposalStatusHistory(
        proposal_id=proposal.id,
        old_status=old_status,
        new_status=ProposalStatus.scheduled_for_review.value,
        changed_by=current_user.id,
        note=f"Assigned {len(payload.reviewer_ids)} reviewer(s).",
    )
    db.add(history)
    await db.commit()

    return MessageResponse(message=f"Reviewers assigned successfully. Proposal moved to 'Scheduled for Review'.")


@router.delete("/proposals/{proposal_id}/reviewers/{reviewer_id}", response_model=MessageResponse)
async def remove_reviewer_assignment(
    proposal_id: int,
    reviewer_id: int,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Remove a reviewer from a proposal."""
    result = await db.execute(
        select(ReviewAssignment).where(
            ReviewAssignment.proposal_id == proposal_id,
            ReviewAssignment.reviewer_id == reviewer_id,
        )
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found.")

    await db.delete(assignment)
    await db.commit()
    return MessageResponse(message="Reviewer removed from proposal.")


# ─────────────────────────────────────────
# ADMIN FINAL DECISION
# ─────────────────────────────────────────

@router.post("/proposals/{proposal_id}/decision", response_model=MessageResponse)
async def make_decision(
    proposal_id: int,
    payload: AdminDecisionRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin approves, rejects, or awards a reviewed proposal."""
    result = await db.execute(
        select(Proposal)
        .where(Proposal.id == proposal_id)
        .options(selectinload(Proposal.created_by_user))
    )
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found.")

    if proposal.status != ProposalStatus.reviewed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only reviewed proposals can receive a final decision.",
        )

    status_map = {
        "Approved": ProposalStatus.approved,
        "Rejected": ProposalStatus.rejected,
        "Awarded": ProposalStatus.awarded,
    }

    old_status = proposal.status.value
    proposal.status = status_map[payload.decision]
    proposal.admin_decision = payload.decision
    proposal.admin_decision_note = payload.note
    proposal.admin_decision_at = datetime.now(timezone.utc)
    proposal.decided_by = current_user.id

    history = ProposalStatusHistory(
        proposal_id=proposal.id,
        old_status=old_status,
        new_status=proposal.status.value,
        changed_by=current_user.id,
        note=payload.note or f"Admin decision: {payload.decision}",
    )
    db.add(history)
    await db.commit()

    # Notify applicant
    applicant = proposal.created_by_user
    background_tasks.add_task(
        send_proposal_decision_email,
        applicant.email,
        f"{applicant.first_name} {applicant.surname}",
        proposal.title,
        proposal.protocol_no,
        payload.decision,
        payload.note or "",
    )

    return MessageResponse(message=f"Proposal has been {payload.decision.lower()} successfully.")
