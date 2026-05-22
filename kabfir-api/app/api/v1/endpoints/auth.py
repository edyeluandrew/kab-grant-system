from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, verify_token
from app.core.deps import get_current_user
from app.models.models import User, UserRole, OTPToken
from app.schemas.schemas import (
    UserRegisterRequest, LoginRequest, TokenResponse, RefreshTokenRequest,
    ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest,
    UserResponse, MessageResponse
)
from app.utils.password import hash_password, verify_password
from app.utils.helpers import generate_otp
from app.utils.email import send_email

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register a new staff/student user. Email must be @kab.ac.ug."""
    # Check email uniqueness
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    user = User(
        first_name=payload.first_name,
        surname=payload.surname,
        other_name=payload.other_name,
        gender=payload.gender,
        phone=payload.phone,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=UserRole.staff,
        faculty_id=payload.faculty_id,
        department_id=payload.department_id,
        is_active=True,
    )
    db.add(user)
    await db.flush()  # get user.id before commit
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Login for all user types."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact the administrator.",
        )

    extra = {"role": user.role.value}
    access_token = create_access_token(user.id, extra)
    refresh_token = create_refresh_token(user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        role=user.role,
        must_change_password=user.must_change_password,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    payload: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Get a new access token using a refresh token."""
    token_data = verify_token(payload.refresh_token, token_type="refresh")
    user_id = int(token_data.get("sub"))

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    extra = {"role": user.role.value}
    return TokenResponse(
        access_token=create_access_token(user.id, extra),
        refresh_token=create_refresh_token(user.id),
        user_id=user.id,
        role=user.role,
        must_change_password=user.must_change_password,
    )


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Request a password reset OTP."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    # Always return success to prevent email enumeration
    if not user:
        return MessageResponse(message="If that email exists, a reset code has been sent.")

    otp = generate_otp(6)
    expires = datetime.now(timezone.utc) + timedelta(hours=1)

    otp_token = OTPToken(
        user_id=user.id,
        otp_code=otp,
        expires_at=expires,
        used=False,
    )
    db.add(otp_token)
    await db.commit()

    full_name = f"{user.first_name} {user.surname}"
    subject = "KAB-FIR — Password Reset Code"
    body = f"""
    <html><body>
    <p>Dear {full_name},</p>
    <p>Your password reset code is: <strong style="font-size:20px;">{otp}</strong></p>
    <p>This code expires in <strong>1 hour</strong>. If you did not request this, ignore this email.</p>
    <br><p>KAB-FIR Grants System</p>
    </body></html>
    """
    background_tasks.add_task(send_email, user.email, subject, body)

    return MessageResponse(message="If that email exists, a reset code has been sent.")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Reset password using OTP."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request.")

    # Find valid unused OTP
    otp_result = await db.execute(
        select(OTPToken).where(
            OTPToken.user_id == user.id,
            OTPToken.otp_code == payload.otp_code,
            OTPToken.used == False,
            OTPToken.expires_at > datetime.now(timezone.utc),
        )
    )
    otp_token = otp_result.scalar_one_or_none()

    if not otp_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code.",
        )

    user.password_hash = hash_password(payload.new_password)
    user.must_change_password = False
    otp_token.used = True
    await db.commit()

    return MessageResponse(message="Password reset successfully. You can now log in.")


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change password for logged-in user (also used for reviewer first-login forced reset)."""
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    current_user.password_hash = hash_password(payload.new_password)
    current_user.must_change_password = False
    await db.commit()

    return MessageResponse(message="Password changed successfully.")


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return current_user
