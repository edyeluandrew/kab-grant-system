import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


async def send_email(to_email: str, subject: str, body_html: str) -> bool:
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = to_email
    message.attach(MIMEText(body_html, "html"))

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


async def send_otp_email(to_email: str, otp: str, reviewer_name: str) -> bool:
    subject = "KAB-FIR — Your Reviewer Account Has Been Created"
    body = f"""
    <html><body>
    <p>Dear {reviewer_name},</p>
    <p>Your reviewer account on the <strong>KAB Fund for Innovation and Research (KAB-FIR)</strong> system has been created.</p>
    <p>Your one-time password (OTP) is: <strong style="font-size:20px;">{otp}</strong></p>
    <p>Please log in and change your password immediately. This OTP expires in <strong>24 hours</strong>.</p>
    <br>
    <p>KAB-FIR Grants System</p>
    <p>Kabale University</p>
    </body></html>
    """
    return await send_email(to_email, subject, body)


async def send_proposal_submitted_email(to_email: str, applicant_name: str, proposal_title: str, protocol_no: str) -> bool:
    subject = f"KAB-FIR - Proposal Submission Confirmed: {protocol_no}"
    body = f"""
    <html><body>
    <p>Dear {applicant_name},</p>
    <p>Your proposal has been successfully submitted to the KAB-FIR Grant Management System.</p>
    <ul>
        <li><strong>Protocol Number:</strong> {protocol_no}</li>
        <li><strong>Proposal Title:</strong> {proposal_title}</li>
        <li><strong>Status:</strong> Submitted - awaiting review assignment</li>
    </ul>
    <p>You will be notified of further updates on your application.</p>
    <br>
    <p>KAB-FIR Grants System</p>
    <p>Kabale University</p>
    </body></html>
    """
    return await send_email(to_email, subject, body)


async def send_reviewer_assignment_email(to_email: str, reviewer_name: str, proposal_title: str, protocol_no: str) -> bool:
    subject = f"KAB-FIR - New Proposal Assigned for Review: {protocol_no}"
    body = f"""
    <html><body>
    <p>Dear {reviewer_name},</p>
    <p>A proposal has been assigned to you for review on the KAB-FIR system.</p>
    <ul>
        <li><strong>Protocol Number:</strong> {protocol_no}</li>
        <li><strong>Proposal Title:</strong> {proposal_title}</li>
    </ul>
    <p>Please log in to the system to access the proposal documents and submit your evaluation.</p>
    <br>
    <p>KAB-FIR Grants System</p>
    <p>Kabale University</p>
    </body></html>
    """
    return await send_email(to_email, subject, body)


async def send_proposal_decision_email(to_email: str, applicant_name: str, proposal_title: str, protocol_no: str, decision: str, note: str = "") -> bool:
    subject = f"KAB-FIR - Decision on Your Proposal: {protocol_no}"
    note_section = f"<p><strong>Note from Admin:</strong> {note}</p>" if note else ""
    body = f"""
    <html><body>
    <p>Dear {applicant_name},</p>
    <p>A decision has been made on your proposal submitted to KAB-FIR.</p>
    <ul>
        <li><strong>Protocol Number:</strong> {protocol_no}</li>
        <li><strong>Proposal Title:</strong> {proposal_title}</li>
        <li><strong>Decision:</strong> <strong>{decision}</strong></li>
    </ul>
    {note_section}
    <p>Log in to the system for more details.</p>
    <br>
    <p>KAB-FIR Grants System</p>
    <p>Kabale University</p>
    </body></html>
    """
    return await send_email(to_email, subject, body)
