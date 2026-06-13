from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime,
    ForeignKey, Numeric, Enum, Date, SmallInteger
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


# ─────────────────────────────────────────
# ENUMS
# ─────────────────────────────────────────

class UserRole(str, enum.Enum):
    admin      = "admin"
    sgo_admin  = "sgo_admin"   # SGO — manages grant calls, award letters, reminders
    staff      = "staff"
    reviewer   = "reviewer"


class Gender(str, enum.Enum):
    male   = "Male"
    female = "Female"


class GrantType(str, enum.Enum):
    research   = "Research"
    innovation = "Innovation"


class ProposalStatus(str, enum.Enum):
    draft                = "Draft"
    missing_attachments  = "Missing Attachments"
    submitted            = "Submitted"
    scheduled_for_review = "Scheduled for Review"
    reviewed             = "Reviewed"
    approved             = "Approved"
    rejected             = "Rejected"
    awarded              = "Awarded"


class ReviewRecommendation(str, enum.Enum):
    approve          = "Approve"
    minor_revisions  = "Minor Revisions"
    major_revisions  = "Major Revisions"
    reject           = "Reject"


class AttachmentType(str, enum.Enum):
    gantt_chart          = "Gantt Chart"
    budget               = "Budget"
    national_id          = "National ID"
    confirmation_letter  = "Confirmation Letter"
    cvs                  = "CVs"
    consent_forms        = "Consent Forms"
    research_instruments = "Research Instruments"
    faculty_support      = "Faculty Support Evidence"
    full_proposal        = "Full Proposal Document"


class GrantCallStatus(str, enum.Enum):
    draft  = "Draft"
    open   = "Open"
    closed = "Closed"


# ─────────────────────────────────────────
# FACULTY & DEPARTMENT
# ─────────────────────────────────────────

class Faculty(Base):
    __tablename__ = "faculties"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(200), nullable=False, unique=True)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    departments = relationship("Department", back_populates="faculty")
    users       = relationship("User", back_populates="faculty")


class Department(Base):
    __tablename__ = "departments"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(200), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculties.id"), nullable=False)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    faculty = relationship("Faculty", back_populates="departments")
    users   = relationship("User", back_populates="department")


# ─────────────────────────────────────────
# USERS
# ─────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id                   = Column(Integer, primary_key=True, index=True)
    first_name           = Column(String(100), nullable=False)
    surname              = Column(String(100), nullable=False)
    other_name           = Column(String(100), nullable=True)
    gender               = Column(Enum(Gender), nullable=False)
    phone                = Column(String(20), nullable=True)
    email                = Column(String(255), nullable=False, unique=True, index=True)
    password_hash        = Column(Text, nullable=False)
    role                 = Column(Enum(UserRole), nullable=False, default=UserRole.staff)
    faculty_id           = Column(Integer, ForeignKey("faculties.id"), nullable=True)
    department_id        = Column(Integer, ForeignKey("departments.id"), nullable=True)
    is_active            = Column(Boolean, default=True)
    must_change_password = Column(Boolean, default=False)
    created_at           = Column(DateTime(timezone=True), server_default=func.now())
    updated_at           = Column(DateTime(timezone=True), onupdate=func.now())

    faculty          = relationship("Faculty", back_populates="users")
    department       = relationship("Department", back_populates="users")
    proposals        = relationship("Proposal", back_populates="created_by_user", foreign_keys="Proposal.created_by")
    otp_tokens       = relationship("OTPToken", back_populates="user")
    reviewer_profile = relationship("Reviewer", back_populates="user", uselist=False, foreign_keys="[Reviewer.user_id]")
    grant_call_interests = relationship("GrantCallInterest", back_populates="user")
    status_changes   = relationship("ProposalStatusHistory", back_populates="changed_by_user")


# ─────────────────────────────────────────
# OTP TOKENS
# ─────────────────────────────────────────

class OTPToken(Base):
    __tablename__ = "otp_tokens"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    otp_code   = Column(String(10), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used       = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="otp_tokens")


# ─────────────────────────────────────────
# REVIEWERS
# ─────────────────────────────────────────

class Reviewer(Base):
    __tablename__ = "reviewers"

    id                   = Column(Integer, primary_key=True, index=True)
    user_id              = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    research_discipline  = Column(String(200), nullable=True)
    assigned_by          = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at           = Column(DateTime(timezone=True), server_default=func.now())

    user             = relationship("User", back_populates="reviewer_profile", foreign_keys=[user_id])
    assigned_by_user = relationship("User", foreign_keys=[assigned_by])
    review_assignments = relationship("ReviewAssignment", back_populates="reviewer")


# ─────────────────────────────────────────
# GRANT CALLS
# ─────────────────────────────────────────

class GrantCall(Base):
    __tablename__ = "grant_calls"

    id                  = Column(Integer, primary_key=True, index=True)
    title               = Column(String(300), nullable=False)
    description         = Column(Text, nullable=True)
    grant_type          = Column(Enum(GrantType), nullable=False)
    academic_year       = Column(Integer, nullable=False)
    opening_date        = Column(Date, nullable=False)
    closing_date        = Column(Date, nullable=False)
    max_budget          = Column(Numeric(15, 2), nullable=True)
    status              = Column(Enum(GrantCallStatus), default=GrantCallStatus.draft, nullable=False)
    created_by          = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at          = Column(DateTime(timezone=True), server_default=func.now())
    updated_at          = Column(DateTime(timezone=True), onupdate=func.now())

    created_by_user = relationship("User", foreign_keys=[created_by])
    interests       = relationship("GrantCallInterest", back_populates="grant_call")


class GrantCallInterest(Base):
    __tablename__ = "grant_call_interests"

    id                   = Column(Integer, primary_key=True, index=True)
    grant_call_id        = Column(Integer, ForeignKey("grant_calls.id"), nullable=False, index=True)
    user_id              = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    file_name            = Column(String(255), nullable=False)
    cloudinary_url       = Column(Text, nullable=False)
    cloudinary_public_id = Column(String(255), nullable=False)
    submitted_at         = Column(DateTime(timezone=True), server_default=func.now())

    grant_call = relationship("GrantCall", back_populates="interests")
    user       = relationship("User", back_populates="grant_call_interests")


# ─────────────────────────────────────────
# PROPOSALS
# ─────────────────────────────────────────

class Proposal(Base):
    __tablename__ = "proposals"

    id          = Column(Integer, primary_key=True, index=True)
    protocol_no = Column(String(50), nullable=False, unique=True, index=True)
    grant_type  = Column(Enum(GrantType), nullable=False)

    # Principal Investigator
    pi_first_name              = Column(String(100), nullable=False)
    pi_last_name               = Column(String(100), nullable=False)
    pi_qualification           = Column(String(100), nullable=False)
    pi_gender                  = Column(Enum(Gender), nullable=False)
    pi_designation             = Column(String(100), nullable=False)
    pi_faculty_id              = Column(Integer, ForeignKey("faculties.id"), nullable=False)
    pi_department              = Column(String(200), nullable=False)
    pi_research_specialization = Column(String(200), nullable=False)
    pi_email                   = Column(String(255), nullable=False)
    pi_phone                   = Column(String(20), nullable=False)
    research_type              = Column(String(100), nullable=False)

    # Content
    title                = Column(Text, nullable=False)
    project_summary      = Column(Text, nullable=False)
    problem_statement    = Column(Text, nullable=False)
    proposed_solution    = Column(Text, nullable=False)
    relevance            = Column(Text, nullable=False)
    innovativeness       = Column(Text, nullable=False)
    main_objective       = Column(Text, nullable=False)
    specific_objectives  = Column(Text, nullable=False)
    methods_description  = Column(Text, nullable=False)
    outcomes             = Column(Text, nullable=False)
    dissemination_plan   = Column(Text, nullable=False)
    policy_impact        = Column(Text, nullable=False)
    scalability          = Column(Text, nullable=False)
    sustainability       = Column(Text, nullable=False)
    gender_considerations = Column(Text, nullable=False)
    ethical_impact       = Column(Text, nullable=False)
    capacity_building    = Column(Text, nullable=False)
    conflict_of_interest = Column(Text, nullable=False)
    references           = Column(Text, nullable=False)
    total_budget         = Column(Numeric(15, 2), nullable=False)

    # Status & tracking
    status        = Column(Enum(ProposalStatus), default=ProposalStatus.draft, nullable=False)
    academic_year = Column(Integer, nullable=False)
    created_by    = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())
    submitted_at  = Column(DateTime(timezone=True), nullable=True)

    # Admin decision
    admin_decision      = Column(String(50), nullable=True)
    admin_decision_note = Column(Text, nullable=True)
    admin_decision_at   = Column(DateTime(timezone=True), nullable=True)
    decided_by          = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    created_by_user  = relationship("User", back_populates="proposals", foreign_keys=[created_by])
    decided_by_user  = relationship("User", foreign_keys=[decided_by])
    pi_faculty       = relationship("Faculty", foreign_keys=[pi_faculty_id])
    attachments      = relationship("ProposalAttachment", back_populates="proposal", cascade="all, delete-orphan")
    team_members     = relationship("ProjectTeamMember", back_populates="proposal", cascade="all, delete-orphan")
    review_assignments = relationship("ReviewAssignment", back_populates="proposal")
    status_history   = relationship("ProposalStatusHistory", back_populates="proposal", order_by="ProposalStatusHistory.changed_at")


# ─────────────────────────────────────────
# PROPOSAL ATTACHMENTS
# ─────────────────────────────────────────

class ProposalAttachment(Base):
    __tablename__ = "proposal_attachments"

    id                  = Column(Integer, primary_key=True, index=True)
    proposal_id         = Column(Integer, ForeignKey("proposals.id"), nullable=False)
    attachment_type     = Column(Enum(AttachmentType), nullable=False)
    file_name           = Column(String(255), nullable=False)
    cloudinary_url      = Column(Text, nullable=False)
    cloudinary_public_id = Column(String(255), nullable=False)
    uploaded_at         = Column(DateTime(timezone=True), server_default=func.now())

    proposal = relationship("Proposal", back_populates="attachments")


# ─────────────────────────────────────────
# PROJECT TEAM MEMBERS
# ─────────────────────────────────────────

class ProjectTeamMember(Base):
    __tablename__ = "project_team_members"

    id             = Column(Integer, primary_key=True, index=True)
    proposal_id    = Column(Integer, ForeignKey("proposals.id"), nullable=False)
    first_name     = Column(String(100), nullable=False)
    last_name      = Column(String(100), nullable=False)
    qualification  = Column(String(100), nullable=False)
    gender         = Column(Enum(Gender), nullable=False)
    designation    = Column(String(100), nullable=False)
    faculty_id     = Column(Integer, ForeignKey("faculties.id"), nullable=True)
    department     = Column(String(200), nullable=True)
    specialization = Column(String(200), nullable=True)
    email          = Column(String(255), nullable=False)
    phone          = Column(String(20), nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    proposal = relationship("Proposal", back_populates="team_members")
    faculty  = relationship("Faculty")


# ─────────────────────────────────────────
# REVIEW ASSIGNMENTS
# ─────────────────────────────────────────

class ReviewAssignment(Base):
    __tablename__ = "review_assignments"

    id            = Column(Integer, primary_key=True, index=True)
    proposal_id   = Column(Integer, ForeignKey("proposals.id"), nullable=False)
    reviewer_id   = Column(Integer, ForeignKey("reviewers.id"), nullable=False)
    assigned_by   = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at   = Column(DateTime(timezone=True), server_default=func.now())
    review_status = Column(String(50), default="Pending")   # Pending | Submitted
    deadline      = Column(Date, nullable=True)              # optional per-reviewer deadline

    proposal         = relationship("Proposal", back_populates="review_assignments")
    reviewer         = relationship("Reviewer", back_populates="review_assignments")
    assigned_by_user = relationship("User", foreign_keys=[assigned_by])
    report           = relationship("ReviewerReport", back_populates="assignment", uselist=False)


# ─────────────────────────────────────────
# REVIEWER REPORTS
# ─────────────────────────────────────────

class ReviewerReport(Base):
    __tablename__ = "reviewer_reports"

    id                   = Column(Integer, primary_key=True, index=True)
    assignment_id        = Column(Integer, ForeignKey("review_assignments.id"), nullable=False, unique=True)
    proposal_id          = Column(Integer, ForeignKey("proposals.id"), nullable=False)
    reviewer_id          = Column(Integer, ForeignKey("reviewers.id"), nullable=False)
    recommendation       = Column(Enum(ReviewRecommendation), nullable=False)
    score                = Column(SmallInteger, nullable=True)   # 1–10
    comments             = Column(Text, nullable=True)
    report_file_url      = Column(Text, nullable=True)
    report_file_public_id = Column(String(255), nullable=True)
    submitted_at         = Column(DateTime(timezone=True), server_default=func.now())

    assignment = relationship("ReviewAssignment", back_populates="report")
    reviewer   = relationship("Reviewer")
    proposal   = relationship("Proposal")


# ─────────────────────────────────────────
# PROPOSAL STATUS HISTORY
# ─────────────────────────────────────────

class ProposalStatusHistory(Base):
    __tablename__ = "proposal_status_history"

    id          = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("proposals.id"), nullable=False)
    old_status  = Column(String(100), nullable=True)
    new_status  = Column(String(100), nullable=False)
    changed_by  = Column(Integer, ForeignKey("users.id"), nullable=False)
    note        = Column(Text, nullable=True)
    changed_at  = Column(DateTime(timezone=True), server_default=func.now())

    proposal         = relationship("Proposal", back_populates="status_history")
    changed_by_user  = relationship("User", back_populates="status_changes")


# ─────────────────────────────────────────
# SYSTEM SETTINGS
# ─────────────────────────────────────────

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id                       = Column(Integer, primary_key=True, index=True)
    system_name              = Column(String(200), default="KAB Fund for Innovation and Research (KAB-FIR)")
    system_motto             = Column(Text, nullable=True)
    address                  = Column(Text, nullable=True)
    email                    = Column(String(255), nullable=True)
    phone                    = Column(String(20), nullable=True)
    logo_url                 = Column(Text, nullable=True)
    active_academic_year     = Column(Integer, nullable=False)
    submission_deadline      = Column(Date, nullable=False)
    is_accepting_applications = Column(Boolean, default=True)
    updated_at               = Column(DateTime(timezone=True), onupdate=func.now())
