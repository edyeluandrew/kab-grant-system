from fastapi import APIRouter
from app.api.v1.endpoints import auth, proposals, admin, reviewer, general, grant_calls, grant_interests

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(proposals.router)
api_router.include_router(admin.router)
api_router.include_router(reviewer.router)
api_router.include_router(general.router)
api_router.include_router(grant_calls.router)
api_router.include_router(grant_interests.router)
