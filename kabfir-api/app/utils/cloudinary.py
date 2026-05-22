import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Configure cloudinary once on import
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


async def upload_file(file: UploadFile, folder: str = "kabfir/attachments") -> dict:
    """
    Validates and uploads a file to Cloudinary.
    Returns dict with url and public_id.
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Only PDF and Word documents are allowed.",
        )

    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds the {MAX_FILE_SIZE_MB}MB limit.",
        )

    try:
        result = cloudinary.uploader.upload(
            contents,
            folder=folder,
            resource_type="raw",
            use_filename=True,
            unique_filename=True,
        )
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "file_name": file.filename,
        }
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="File upload failed. Please try again.",
        )


async def delete_file(public_id: str) -> bool:
    try:
        cloudinary.uploader.destroy(public_id, resource_type="raw")
        return True
    except Exception as e:
        logger.error(f"Cloudinary delete failed for {public_id}: {e}")
        return False
