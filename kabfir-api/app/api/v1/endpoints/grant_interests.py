from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_active_staff
from app.models.models import GrantCall, GrantCallInterest, GrantCallStatus, User
from app.schemas.schemas import GrantCallInterestResponse
from app.utils.cloudinary import upload_pdf_file

router = APIRouter(prefix="/grant-calls", tags=["Grant Call Interests"])


async def _get_open_grant_call(call_id: int, db: AsyncSession) -> GrantCall:
    result = await db.execute(select(GrantCall).where(GrantCall.id == call_id))
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grant call not found.")
    if call.status != GrantCallStatus.open:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interest can only be expressed for open grant calls.",
        )
    return call


def _to_interest_response(interest: GrantCallInterest) -> GrantCallInterestResponse:
    call = interest.grant_call
    return GrantCallInterestResponse(
        id=interest.id,
        grant_call_id=interest.grant_call_id,
        grant_call_title=call.title,
        grant_type=call.grant_type.value if hasattr(call.grant_type, "value") else str(call.grant_type),
        grant_call_status=call.status.value if hasattr(call.status, "value") else str(call.status),
        file_name=interest.file_name,
        document_url=interest.cloudinary_url,
        status="Submitted",
        submitted_at=interest.submitted_at,
    )


@router.get("/my-interests", response_model=List[GrantCallInterestResponse])
async def list_my_interests(
    current_user: User = Depends(get_current_active_staff),
    db: AsyncSession = Depends(get_db),
):
    """List grant call interests submitted by the current user."""
    result = await db.execute(
        select(GrantCallInterest)
        .where(GrantCallInterest.user_id == current_user.id)
        .options(selectinload(GrantCallInterest.grant_call))
        .order_by(GrantCallInterest.submitted_at.desc())
    )
    interests = result.scalars().all()
    return [_to_interest_response(i) for i in interests]


@router.get("/{call_id}/my-interest", response_model=GrantCallInterestResponse)
async def get_my_interest_for_call(
    call_id: int,
    current_user: User = Depends(get_current_active_staff),
    db: AsyncSession = Depends(get_db),
):
    """Get the current user's interest submission for a specific grant call."""
    result = await db.execute(
        select(GrantCallInterest)
        .where(
            GrantCallInterest.grant_call_id == call_id,
            GrantCallInterest.user_id == current_user.id,
        )
        .options(selectinload(GrantCallInterest.grant_call))
    )
    interest = result.scalar_one_or_none()
    if not interest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interest not submitted yet.")
    return _to_interest_response(interest)


@router.post("/{call_id}/interests", response_model=GrantCallInterestResponse, status_code=status.HTTP_201_CREATED)
async def submit_grant_call_interest(
    call_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_staff),
    db: AsyncSession = Depends(get_db),
):
    """Submit interest for a grant call by uploading a PDF document."""
    await _get_open_grant_call(call_id, db)

    existing = await db.execute(
        select(GrantCallInterest).where(
            GrantCallInterest.grant_call_id == call_id,
            GrantCallInterest.user_id == current_user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already expressed interest for this grant call.",
        )

    upload_result = await upload_pdf_file(file, folder=f"kabfir/interests/{call_id}")

    interest = GrantCallInterest(
        grant_call_id=call_id,
        user_id=current_user.id,
        file_name=upload_result["file_name"],
        cloudinary_url=upload_result["url"],
        cloudinary_public_id=upload_result["public_id"],
    )
    db.add(interest)
    await db.commit()

    result = await db.execute(
        select(GrantCallInterest)
        .where(GrantCallInterest.id == interest.id)
        .options(selectinload(GrantCallInterest.grant_call))
    )
    saved = result.scalar_one()
    return _to_interest_response(saved)
