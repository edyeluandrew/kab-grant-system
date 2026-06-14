from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_active_staff
from app.models.models import (
    User, Proposal, ProposalAttachment, ProjectTeamMember,
    ProposalStatus, ProposalStatusHistory, AttachmentType, SystemSetting
)
from app.schemas.schemas import (
    ProposalCreateRequest, ProposalUpdateRequest, ProposalResponse,
    ProposalDetailResponse, AttachmentResponse, TeamMemberCreateRequest,
    TeamMemberResponse, MessageResponse
)
from app.utils.helpers import generate_protocol_number, is_submission_open
from app.utils.file_storage import upload_file, delete_file
from app.utils.email import send_proposal_submitted_email

router = APIRouter(prefix="/proposals", tags=["Proposals"])


def _check_proposal_owner(proposal: Proposal, user: User):
    if proposal.created_by != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this proposal.",
        )


async def _load_proposal(proposal_id: int, db: AsyncSession) -> Proposal:
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
# CREATE PROPOSAL (save as draft)
# ─────────────────────────────────────────

@router.post("", response_model=ProposalDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_proposal(
    payload: ProposalCreateRequest,
    current_user: User = Depends(get_current_active_staff),
    db: AsyncSession = Depends(get_db),
):
    """Save a new proposal as a draft. Enforces academic year and deadline."""
    is_open, reason = is_submission_open()
    if not is_open:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=reason)

    from app.core.config import settings
    academic_year = settings.ACTIVE_ACADEMIC_YEAR

    # Check title uniqueness for this user this year
    dup = await db.execute(
        select(Proposal).where(
            Proposal.title == payload.title,
            Proposal.academic_year == academic_year,
            Proposal.created_by == current_user.id,
        )
    )
    if dup.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a proposal with this title this year.",
        )

    proposal = Proposal(
        protocol_no="TEMP",  # will update after flush to get id
        grant_type=payload.grant_type,
        pi_first_name=payload.pi_first_name,
        pi_last_name=payload.pi_last_name,
        pi_qualification=payload.pi_qualification,
        pi_gender=payload.pi_gender,
        pi_designation=payload.pi_designation,
        pi_faculty_id=payload.pi_faculty_id,
        pi_department=payload.pi_department,
        pi_research_specialization=payload.pi_research_specialization,
        pi_email=str(payload.pi_email),
        pi_phone=payload.pi_phone,
        research_type=payload.research_type,
        title=payload.title,
        project_summary=payload.project_summary,
        problem_statement=payload.problem_statement,
        proposed_solution=payload.proposed_solution,
        relevance=payload.relevance,
        innovativeness=payload.innovativeness,
        main_objective=payload.main_objective,
        specific_objectives=payload.specific_objectives,
        methods_description=payload.methods_description,
        outcomes=payload.outcomes,
        dissemination_plan=payload.dissemination_plan,
        policy_impact=payload.policy_impact,
        scalability=payload.scalability,
        sustainability=payload.sustainability,
        gender_considerations=payload.gender_considerations,
        ethical_impact=payload.ethical_impact,
        capacity_building=payload.capacity_building,
        conflict_of_interest=payload.conflict_of_interest,
        references=payload.references,
        total_budget=payload.total_budget,
        status=ProposalStatus.draft,
        academic_year=academic_year,
        created_by=current_user.id,
    )
    db.add(proposal)
    await db.flush()

    # Now assign real protocol number
    proposal.protocol_no = generate_protocol_number(academic_year, proposal.id)

    # Audit trail entry
    history = ProposalStatusHistory(
        proposal_id=proposal.id,
        old_status=None,
        new_status=ProposalStatus.draft.value,
        changed_by=current_user.id,
        note="Proposal created as draft.",
    )
    db.add(history)
    await db.commit()
    await db.refresh(proposal)

    return await _load_proposal(proposal.id, db)


# ─────────────────────────────────────────
# GET MY PROPOSALS
# ─────────────────────────────────────────

@router.get("/my", response_model=List[ProposalResponse])
async def get_my_proposals(
    current_user: User = Depends(get_current_active_staff),
    db: AsyncSession = Depends(get_db),
):
    """Get all proposals created by the logged-in staff member."""
    result = await db.execute(
        select(Proposal)
        .where(Proposal.created_by == current_user.id)
        .options(selectinload(Proposal.attachments), selectinload(Proposal.team_members))
        .order_by(Proposal.created_at.desc())
    )
    return result.scalars().all()


# ─────────────────────────────────────────
# GET SINGLE PROPOSAL
# ─────────────────────────────────────────

@router.get("/{proposal_id}", response_model=ProposalDetailResponse)
async def get_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get full proposal details. Staff can only view their own."""
    from app.models.models import UserRole
    proposal = await _load_proposal(proposal_id, db)

    if current_user.role == UserRole.staff and proposal.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return proposal


# ─────────────────────────────────────────
# UPDATE PROPOSAL (only while draft)
# ─────────────────────────────────────────

@router.patch("/{proposal_id}", response_model=ProposalDetailResponse)
async def update_proposal(
    proposal_id: int,
    payload: ProposalUpdateRequest,
    current_user: User = Depends(get_current_active_staff),
    db: AsyncSession = Depends(get_db),
):
    """Update a draft proposal."""
    proposal = await _load_proposal(proposal_id, db)
    _check_proposal_owner(proposal, current_user)

    if proposal.status not in (ProposalStatus.draft, ProposalStatus.missing_attachments):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft proposals can be edited.",
        )

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(proposal, field, value)

    await db.commit()
    return await _load_proposal(proposal_id, db)


# ─────────────────────────────────────────
# DELETE PROPOSAL (only draft)
# ─────────────────────────────────────────

@router.delete("/{proposal_id}", response_model=MessageResponse)
async def delete_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_active_staff),
    db: AsyncSession = Depends(get_db),
):
    """Delete a draft proposal."""
    result = await db.execute(select(Proposal).where(Proposal.id == proposal_id))
    proposal = result.scalar_one_or_none()
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found.")

    _check_proposal_owner(proposal, current_user)

    if proposal.status != ProposalStatus.draft:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft proposals can be deleted.",
        )

    await db.delete(proposal)
    await db.commit()
    return MessageResponse(message="Proposal deleted successfully.")


# ─────────────────────────────────────────
# UPLOAD ATTACHMENT
# ─────────────────────────────────────────

@router.post("/{proposal_id}/attachments", response_model=AttachmentResponse, status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    proposal_id: int,
    attachment_type: AttachmentType = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_staff),
    db: AsyncSession = Depends(get_db),
):
    """Upload a supporting document for a proposal."""
    proposal = await _load_proposal(proposal_id, db)
    _check_proposal_owner(proposal, current_user)

    if proposal.status not in (ProposalStatus.draft, ProposalStatus.missing_attachments):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot upload attachments to a submitted proposal.",
        )

    # Remove existing attachment of same type if any
    existing = next((a for a in proposal.attachments if a.attachment_type == attachment_type), None)
    if existing:
        await delete_file(existing.file_public_id)
        await db.delete(existing)

    upload_result = await upload_file(file, folder=f"proposals/{proposal_id}")

    attachment = ProposalAttachment(
        proposal_id=proposal.id,
        attachment_type=attachment_type,
        file_name=upload_result["file_name"],
        file_url=upload_result["url"],
        file_public_id=upload_result["public_id"],
    )
    db.add(attachment)
    await db.commit()
    await db.refresh(attachment)

    # After upload check if all required attachments are present
    await _update_proposal_status_after_upload(proposal, db)

    return attachment


async def _update_proposal_status_after_upload(proposal: Proposal, db: AsyncSession):
    """Auto-update proposal status based on attachment completeness."""
    # Reload fresh
    result = await db.execute(
        select(Proposal)
        .where(Proposal.id == proposal.id)
        .options(selectinload(Proposal.attachments))
    )
    fresh = result.scalar_one()
    uploaded_types = {a.attachment_type for a in fresh.attachments}
    required_types = set(AttachmentType)

    if required_types.issubset(uploaded_types):
        if fresh.status in (ProposalStatus.draft, ProposalStatus.missing_attachments):
            fresh.status = ProposalStatus.submitted
            fresh.submitted_at = datetime.now(timezone.utc)
            history = ProposalStatusHistory(
                proposal_id=fresh.id,
                old_status=ProposalStatus.missing_attachments.value,
                new_status=ProposalStatus.submitted.value,
                changed_by=fresh.created_by,
                note="All attachments uploaded. Proposal auto-submitted.",
            )
            db.add(history)
    else:
        if fresh.status == ProposalStatus.draft:
            fresh.status = ProposalStatus.missing_attachments
    await db.commit()


# ─────────────────────────────────────────
# ADD TEAM MEMBER
# ─────────────────────────────────────────

@router.post("/{proposal_id}/team-members", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_team_member(
    proposal_id: int,
    payload: TeamMemberCreateRequest,
    current_user: User = Depends(get_current_active_staff),
    db: AsyncSession = Depends(get_db),
):
    """Add a project team member to a proposal."""
    proposal = await _load_proposal(proposal_id, db)
    _check_proposal_owner(proposal, current_user)

    member = ProjectTeamMember(
        proposal_id=proposal.id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        qualification=payload.qualification,
        gender=payload.gender,
        designation=payload.designation,
        faculty_id=payload.faculty_id,
        department=payload.department,
        specialization=payload.specialization,
        email=str(payload.email),
        phone=payload.phone,
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return member


@router.delete("/{proposal_id}/team-members/{member_id}", response_model=MessageResponse)
async def remove_team_member(
    proposal_id: int,
    member_id: int,
    current_user: User = Depends(get_current_active_staff),
    db: AsyncSession = Depends(get_db),
):
    """Remove a team member from a proposal."""
    proposal = await _load_proposal(proposal_id, db)
    _check_proposal_owner(proposal, current_user)

    result = await db.execute(
        select(ProjectTeamMember).where(
            ProjectTeamMember.id == member_id,
            ProjectTeamMember.proposal_id == proposal_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found.")

    await db.delete(member)
    await db.commit()
    return MessageResponse(message="Team member removed.")
