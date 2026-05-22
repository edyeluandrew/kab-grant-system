from fastapi import APIRouter
from app.api.v1.endpoints import auth, proposals, admin, reviewer, general

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(proposals.router)
api_router.include_router(admin.router)
api_router.include_router(reviewer.router)
api_router.include_router(general.router)
