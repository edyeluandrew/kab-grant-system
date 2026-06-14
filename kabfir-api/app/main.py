from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router
import logging
from fastapi.staticfiles import StaticFiles
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified.")
    yield
    # Shutdown
    await engine.dispose()
    logger.info("Database connection closed.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## KAB-FIR Grant Management System API

Manages the full lifecycle of research and innovation grant applications at Kabale University.

### User Roles
- **Staff** - register with @kab.ac.ug email, submit proposals
- **Reviewer** - created by admin, reviews assigned proposals
- **Admin/SGO** - full system access, user management, decisions

### Grant Types
- **Research Projects** - full academic research proposals
- **Innovation Grants** - concept-based innovation applications

### Flow
1. Staff submits proposal → uploads attachments → auto-submitted
2. Admin assigns 1–3 reviewers
3. Each reviewer independently submits their report
4. Once all reviews in → Admin makes final decision
5. Applicant notified of outcome
    """,
    docs_url="/docs",
    redoc_url="/redoc",
)


Path("uploads").mkdir(exist_ok=True)
app.mount("/files", StaticFiles(directory="uploads"), name="files")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routes
app.include_router(api_router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "system": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}
