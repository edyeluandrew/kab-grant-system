from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_admin, get_current_user
from app.models.models import Faculty, Department, SystemSetting, GrantCall, GrantCallStatus
from app.schemas.schemas import (
    FacultyResponse, DepartmentResponse, MessageResponse, GrantCallResponse,
)
from pydantic import BaseModel
from datetime import date
from typing import Optional

router = APIRouter(prefix="/general", tags=["General"])


# ─────────────────────────────────────────
# FACULTIES
# ─────────────────────────────────────────

class FacultyCreateRequest(BaseModel):
    name: str


@router.get("/faculties", response_model=List[FacultyResponse])
async def list_faculties(db: AsyncSession = Depends(get_db)):
    """Public — list all active faculties (needed for registration form)."""
    result = await db.execute(
        select(Faculty).where(Faculty.is_active == True).order_by(Faculty.name)
    )
    return result.scalars().all()


@router.post("/faculties", response_model=FacultyResponse, status_code=status.HTTP_201_CREATED)
async def create_faculty(
    payload: FacultyCreateRequest,
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(Faculty).where(Faculty.name == payload.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Faculty already exists.")
    faculty = Faculty(name=payload.name)
    db.add(faculty)
    await db.commit()
    await db.refresh(faculty)
    return faculty


@router.delete("/faculties/{faculty_id}", response_model=MessageResponse)
async def delete_faculty(
    faculty_id: int,
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Faculty).where(Faculty.id == faculty_id))
    faculty = result.scalar_one_or_none()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found.")
    faculty.is_active = False
    await db.commit()
    return MessageResponse(message="Faculty deactivated.")


# ─────────────────────────────────────────
# DEPARTMENTS
# ─────────────────────────────────────────

class DepartmentCreateRequest(BaseModel):
    name: str
    faculty_id: int


@router.get("/departments", response_model=List[DepartmentResponse])
async def list_departments(
    faculty_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """Public — list departments, optionally filtered by faculty."""
    query = select(Department).where(Department.is_active == True)
    if faculty_id:
        query = query.where(Department.faculty_id == faculty_id)
    result = await db.execute(query.order_by(Department.name))
    return result.scalars().all()


@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(
    payload: DepartmentCreateRequest,
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    faculty = await db.execute(select(Faculty).where(Faculty.id == payload.faculty_id))
    if not faculty.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Faculty not found.")
    dept = Department(name=payload.name, faculty_id=payload.faculty_id)
    db.add(dept)
    await db.commit()
    await db.refresh(dept)
    return dept


@router.delete("/departments/{dept_id}", response_model=MessageResponse)
async def delete_department(
    dept_id: int,
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Department).where(Department.id == dept_id))
    dept = result.scalar_one_or_none()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found.")
    dept.is_active = False
    await db.commit()
    return MessageResponse(message="Department deactivated.")


# ─────────────────────────────────────────
# SYSTEM SETTINGS
# ─────────────────────────────────────────

class SystemSettingUpdateRequest(BaseModel):
    system_name: Optional[str] = None
    system_motto: Optional[str] = None
    address: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    active_academic_year: Optional[int] = None
    submission_deadline: Optional[date] = None
    is_accepting_applications: Optional[bool] = None


class SystemSettingResponse(BaseModel):
    id: int
    system_name: str
    system_motto: Optional[str]
    address: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    active_academic_year: int
    submission_deadline: date
    is_accepting_applications: bool

    model_config = {"from_attributes": True}


@router.get("/grant-calls", response_model=List[GrantCallResponse])
async def list_open_grant_calls(db: AsyncSession = Depends(get_db)):
    """Public — list open grant calls for the landing page and anonymous visitors."""
    result = await db.execute(
        select(GrantCall)
        .where(GrantCall.status == GrantCallStatus.open)
        .order_by(GrantCall.created_at.desc())
    )
    return result.scalars().all()


@router.get("/settings", response_model=SystemSettingResponse)
async def get_settings(db: AsyncSession = Depends(get_db)):
    """Public — get current system settings."""
    result = await db.execute(select(SystemSetting).limit(1))
    settings = result.scalar_one_or_none()
    if not settings:
        raise HTTPException(status_code=404, detail="System settings not configured.")
    return settings


@router.patch("/settings", response_model=SystemSettingResponse)
async def update_settings(
    payload: SystemSettingUpdateRequest,
    current_user=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin — update system settings including academic year and submission deadline."""
    result = await db.execute(select(SystemSetting).limit(1))
    settings_obj = result.scalar_one_or_none()

    if not settings_obj:
        # Create initial settings if none exist
        settings_obj = SystemSetting(
            active_academic_year=payload.active_academic_year or 2026,
            submission_deadline=payload.submission_deadline or date(2026, 12, 31),
        )
        db.add(settings_obj)

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(settings_obj, field, value)

    await db.commit()
    await db.refresh(settings_obj)
    return settings_obj
