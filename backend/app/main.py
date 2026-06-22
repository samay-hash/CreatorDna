"""
FastAPI Application Entry Point
Creator Intelligence OS — Pattern Engine V1
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db
from app.api.analysis import router as analysis_router
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import uuid
from app.database import get_db
from app.models import WaitlistEntry
from app.schemas import WaitlistCreate, WaitlistResponse, WaitlistCountResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — runs on startup and shutdown."""
    # Startup
    await init_db()
    print(f"✅ {settings.APP_NAME} v{settings.APP_VERSION} started")
    print(f"📦 Database initialized")
    yield
    # Shutdown
    print("🛑 Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered YouTube Pattern Engine — discovers what works on a creator's channel",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(analysis_router)



@app.get("/health", tags=["system"])
async def health_check():
    return JSONResponse({
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    })


@app.get("/", tags=["system"])
async def root():
    return JSONResponse({
        "message": f"Welcome to {settings.APP_NAME}",
        "docs": "/docs",
        "version": settings.APP_VERSION,
    })


# ─── Waitlist ────────────────────────────────────────────────────────────────
@app.post("/api/waitlist", tags=["waitlist"], response_model=WaitlistResponse)
async def join_waitlist(
    data: WaitlistCreate,
    db: AsyncSession = Depends(get_db),
):
    # Check if email already exists
    stmt = select(WaitlistEntry).where(WaitlistEntry.email == data.email)
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()

    if existing:
        # Return success anyway so we don't leak emails
        stmt_count = select(func.count(WaitlistEntry.id))
        count_res = await db.execute(stmt_count)
        real_count = count_res.scalar() or 0
        return WaitlistResponse(message="You are already on the waitlist!", count=real_count)

    # Insert new
    entry = WaitlistEntry(
        id=str(uuid.uuid4()),
        email=data.email
    )
    db.add(entry)
    await db.commit()

    # Get updated count
    stmt_count = select(func.count(WaitlistEntry.id))
    count_res = await db.execute(stmt_count)
    real_count = count_res.scalar() or 1

    return WaitlistResponse(
        message="Successfully joined the waitlist!",
        count=real_count
    )

@app.get("/api/waitlist/count", tags=["waitlist"], response_model=WaitlistCountResponse)
async def get_waitlist_count(db: AsyncSession = Depends(get_db)):
    stmt_count = select(func.count(WaitlistEntry.id))
    count_res = await db.execute(stmt_count)
    real_count = count_res.scalar() or 0
    return WaitlistCountResponse(count=real_count)

@app.get("/api/waitlist/recent", tags=["waitlist"])
async def get_recent_waitlist(db: AsyncSession = Depends(get_db)):
    stmt = select(WaitlistEntry.email).order_by(WaitlistEntry.created_at.desc()).limit(10)
    result = await db.execute(stmt)
    emails = result.scalars().all()
    # Extract just the first part of the email for privacy
    names = [email.split("@")[0].capitalize() for email in emails]
    return names

@app.get("/api/waitlist/all", tags=["waitlist"])
async def get_all_waitlist(
    x_admin_password: str = Header(None), 
    db: AsyncSession = Depends(get_db)
):
    if x_admin_password != "siddhi":
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    stmt = select(WaitlistEntry).order_by(WaitlistEntry.created_at.desc())
    result = await db.execute(stmt)
    entries = result.scalars().all()
    
    return [
        {
            "id": entry.id,
            "email": entry.email,
            "status": "pending",
            "created_at": entry.created_at
        }
        for entry in entries
    ]

@app.delete("/api/waitlist/{entry_id}", tags=["waitlist"])
async def delete_waitlist_entry(
    entry_id: str,
    x_admin_password: str = Header(None), 
    db: AsyncSession = Depends(get_db)
):
    if x_admin_password != "siddhi":
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    stmt = select(WaitlistEntry).where(WaitlistEntry.id == entry_id)
    result = await db.execute(stmt)
    entry = result.scalar_one_or_none()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
        
    await db.delete(entry)
    await db.commit()
    
    return {"message": "Entry deleted successfully"}


