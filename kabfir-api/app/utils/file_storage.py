
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
import logging

logger = logging.getLogger(__name__)

UPLOAD_DIR          = Path("uploads")
ALLOWED_MIME_TYPES  = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
ALLOWED_EXTENSIONS  = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE_MB    = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


async def upload_file(file: UploadFile, folder: str = "general") -> dict:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and Word documents (.pdf, .doc, .docx) are allowed.",
        )
    original_name = file.filename or "upload"
    ext = Path(original_name).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds {MAX_FILE_SIZE_MB}MB limit.",
        )
    save_dir = UPLOAD_DIR / folder
    save_dir.mkdir(parents=True, exist_ok=True)
    unique_name = f"{uuid.uuid4().hex}{ext}"
    save_path   = save_dir / unique_name
    with open(save_path, "wb") as f:
        f.write(contents)
    logger.info(f"File saved: {save_path}")
    return {
        "url":       f"/files/{folder}/{unique_name}",
        "public_id": str(save_path),
        "file_name": original_name,
    }


async def delete_file(public_id: str) -> bool:
    try:
        path = Path(public_id)
        if path.exists():
            path.unlink()
        return True
    except Exception as e:
        logger.error(f"File delete failed for {public_id}: {e}")
        return False