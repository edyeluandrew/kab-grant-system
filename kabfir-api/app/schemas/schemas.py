from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from app.models.models import (
    UserRole, Gender, GrantType, ProposalStatus,
    ReviewRecommendation, AttachmentType, GrantCallStatus
)


# ─────────────────────────────────────────
# AUTH SCHEMAS
# ─────────────────────────────────────────

class UserRegisterRequest(BaseModel):
    first_name: str
    surname: str
    other_name: Optional[str] = None
    gender: Gender
    phone: Optional[str] = None
    email: EmailStr
    password: str
    confirm_password: str
    faculty_id: int
    department_id: int

    @field_validator("email")
    @classmethod
    def email_must_be_kab(cls, v: str) -> str:
        if not v.lower().endswith("@kab.ac.ug"):
            raise ValueError("Only Kabale University email addresses (@kab.ac.ug) are allowed to register.")
        return v.lower()

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v

    @model_validator(mode="after")
    def passwords_match(self) -> "UserRegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int
    role: UserRole
    must_change_password: bool = False


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self) -> "ResetPasswordRequest":
        if self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self) -> "ChangePasswordRequest":
        if self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


# ─────────────────────────────────────────
# USER SCHEMAS
# ─────────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    first_name: str
    surname: str
    other_name: Optional[str]
    gender: Gender
    phone: Optional[str]
    email: str
    role: UserRole
    faculty_id: Optional[int]
    department_id: Optional[int]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class FacultyResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class DepartmentResponse(BaseModel):
    id: int
    name: str
    faculty_id: int

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# REVIEWER SCHEMAS
# ─────────────────────────────────────────

class CreateReviewerRequest(BaseModel):
    first_name: str
    surname: str
    gender: Gender
    phone: Optional[str] = None
    research_discipline: Optional[str] = None
    email: EmailStr
    password: str
    confirm_password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v

    @model_validator(mode="after")
    def passwords_match(self) -> "CreateReviewerRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


class ReviewerResponse(BaseModel):
    id: int
    user_id: int
    research_discipline: Optional[str]
    created_at: datetime
    user: UserResponse

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# PROPOSAL SCHEMAS
# ─────────────────────────────────────────

class ProposalCreateRequest(BaseModel):
    grant_type: GrantType
    pi_first_name: str
    pi_last_name: str
    pi_qualification: str
    pi_gender: Gender
    pi_designation: str
    pi_faculty_id: int
    pi_department: str
    pi_research_specialization: str
    pi_email: EmailStr
    pi_phone: str
    research_type: str
    title: str
    project_summary: str
    problem_statement: str
    proposed_solution: str
    relevance: str
    innovativeness: str
    main_objective: str
    specific_objectives: str
    methods_description: str
    outcomes: str
    dissemination_plan: str
    policy_impact: str
    scalability: str
    sustainability: str
    gender_considerations: str
    ethical_impact: str
    capacity_building: str
    conflict_of_interest: str
    references: str
    total_budget: Decimal


class ProposalUpdateRequest(BaseModel):
    pi_first_name: Optional[str] = None
    pi_last_name: Optional[str] = None
    pi_qualification: Optional[str] = None
    pi_gender: Optional[Gender] = None
    pi_designation: Optional[str] = None
    pi_faculty_id: Optional[int] = None
    pi_department: Optional[str] = None
    pi_research_specialization: Optional[str] = None
    pi_email: Optional[EmailStr] = None
    pi_phone: Optional[str] = None
    research_type: Optional[str] = None
    title: Optional[str] = None
    project_summary: Optional[str] = None
    problem_statement: Optional[str] = None
    proposed_solution: Optional[str] = None
    relevance: Optional[str] = None
    innovativeness: Optional[str] = None
    main_objective: Optional[str] = None
    specific_objectives: Optional[str] = None
    methods_description: Optional[str] = None
    outcomes: Optional[str] = None
    dissemination_plan: Optional[str] = None
    policy_impact: Optional[str] = None
    scalability: Optional[str] = None
    sustainability: Optional[str] = None
    gender_considerations: Optional[str] = None
    ethical_impact: Optional[str] = None
    capacity_building: Optional[str] = None
    conflict_of_interest: Optional[str] = None
    references: Optional[str] = None
    total_budget: Optional[Decimal] = None


class AttachmentResponse(BaseModel):
    id: int
    attachment_type: AttachmentType
    file_name: str
    file_url: str              # ← matches the model
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class TeamMemberCreateRequest(BaseModel):
    first_name: str
    last_name: str
    qualification: str
    gender: Gender
    designation: str
    faculty_id: Optional[int] = None
    department: Optional[str] = None
    specialization: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None


class TeamMemberResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    qualification: str
    gender: Gender
    designation: str
    email: str
    phone: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class StatusHistoryResponse(BaseModel):
    old_status: Optional[str]
    new_status: str
    note: Optional[str]
    changed_at: datetime

    model_config = {"from_attributes": True}


class ProposalResponse(BaseModel):
    id: int
    protocol_no: str
    grant_type: GrantType
    title: str
    pi_first_name: str
    pi_last_name: str
    pi_email: str
    pi_phone: str
    research_type: str
    total_budget: Decimal
    status: ProposalStatus
    academic_year: int
    created_at: datetime
    submitted_at: Optional[datetime]
    attachments: List[AttachmentResponse] = []
    team_members: List[TeamMemberResponse] = []

    model_config = {"from_attributes": True}


class ProposalDetailResponse(ProposalResponse):
    project_summary: str
    problem_statement: str
    proposed_solution: str
    relevance: str
    innovativeness: str
    main_objective: str
    specific_objectives: str
    methods_description: str
    outcomes: str
    dissemination_plan: str
    policy_impact: str
    scalability: str
    sustainability: str
    gender_considerations: str
    ethical_impact: str
    capacity_building: str
    conflict_of_interest: str
    references: str
    admin_decision: Optional[str]
    admin_decision_note: Optional[str]
    status_history: List[StatusHistoryResponse] = []


# ─────────────────────────────────────────
# REVIEW SCHEMAS
# ─────────────────────────────────────────

class AssignReviewerRequest(BaseModel):
    reviewer_ids: List[int]

    @field_validator("reviewer_ids")
    @classmethod
    def max_three_reviewers(cls, v: List[int]) -> List[int]:
        if len(v) > 3:
            raise ValueError("A maximum of 3 reviewers can be assigned per proposal.")
        if len(v) < 1:
            raise ValueError("At least one reviewer must be assigned.")
        return v


class ReviewAssignmentResponse(BaseModel):
    id: int
    proposal_id: int
    reviewer_id: int
    assigned_at: datetime
    review_status: str
    reviewer: ReviewerResponse

    model_config = {"from_attributes": True}


class SubmitReviewRequest(BaseModel):
    recommendation: ReviewRecommendation
    score: Optional[int] = None          # 1–10
    comments: Optional[str] = None

    @field_validator("score")
    @classmethod
    def score_range(cls, v):
        if v is not None and not (1 <= v <= 10):
            raise ValueError("score must be between 1 and 10.")
        return v


class ReviewerReportResponse(BaseModel):
    id: int
    recommendation: ReviewRecommendation
    score: Optional[int]
    comments: Optional[str]
    report_file_url: Optional[str]
    submitted_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────
# ADMIN DECISION SCHEMA
# ─────────────────────────────────────────

class AdminDecisionRequest(BaseModel):
    decision: str  # Approved, Rejected, Awarded
    note: Optional[str] = None

    @field_validator("decision")
    @classmethod
    def valid_decision(cls, v: str) -> str:
        allowed = {"Approved", "Rejected", "Awarded"}
        if v not in allowed:
            raise ValueError(f"Decision must be one of: {', '.join(allowed)}")
        return v


# ─────────────────────────────────────────
# DASHBOARD STATS SCHEMA
# ─────────────────────────────────────────

class DashboardStatsResponse(BaseModel):
    submitted: int
    scheduled_for_review: int
    reviewed: int
    approved: int
    rejected: int
    awarded: int
    total: int


# ─────────────────────────────────────────
# GENERIC RESPONSE
# ─────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str


# ─────────────────────────────────────────
# GRANT CALL SCHEMAS
# ─────────────────────────────────────────

class GrantCallCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    grant_type: GrantType
    academic_year: int
    opening_date: date
    closing_date: date
    max_budget: Optional[Decimal] = None

    @field_validator("closing_date")
    @classmethod
    def closing_after_opening(cls, v, info):
        if "opening_date" in info.data and v <= info.data["opening_date"]:
            raise ValueError("closing_date must be after opening_date.")
        return v


class GrantCallUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    opening_date: Optional[date] = None
    closing_date: Optional[date] = None
    max_budget: Optional[Decimal] = None


class GrantCallResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    grant_type: GrantType
    academic_year: int
    opening_date: date
    closing_date: date
    max_budget: Optional[Decimal]
    status: str
    created_at: datetime
    interest_count: Optional[int] = None

    model_config = {"from_attributes": True}


class GrantCallInterestResponse(BaseModel):
    id: int
    grant_call_id: int
    grant_call_title: str
    grant_type: str
    grant_call_status: str
    file_name: str
    document_url: str
    status: str
    submitted_at: datetime


class AdminGrantCallInterestResponse(BaseModel):
    id: int
    grant_call_id: int
    user_id: int
    first_name: str
    surname: str
    email: str
    file_name: str
    document_url: str
    submitted_at: datetime


# ─────────────────────────────────────────
# REVIEW DEADLINE SCHEMA
# ─────────────────────────────────────────

class SetReviewDeadlineRequest(BaseModel):
    deadline: date
