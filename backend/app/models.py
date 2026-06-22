from sqlalchemy import (
    Column, String, Integer, BigInteger, Float, Text,
    DateTime, Enum, JSON, ForeignKey, Boolean
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class AnalysisStatus(str, enum.Enum):
    PENDING = "pending"
    FETCHING = "fetching"
    ANALYZING = "analyzing"
    COMPLETE = "complete"
    FAILED = "failed"


class PerformanceTier(str, enum.Enum):
    TOP = "top"
    AVERAGE = "average"
    UNDER = "under"


class Channel(Base):
    __tablename__ = "channels"

    id = Column(String, primary_key=True)  # UUID
    channel_id = Column(String, unique=True, nullable=False, index=True)
    handle = Column(String, nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    subscriber_count = Column(BigInteger, default=0)
    video_count = Column(Integer, default=0)
    view_count = Column(BigInteger, default=0)
    country = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    videos = relationship("Video", back_populates="channel", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="channel", cascade="all, delete-orphan")


class Video(Base):
    __tablename__ = "videos"

    id = Column(String, primary_key=True)   # UUID
    channel_fk = Column(String, ForeignKey("channels.id"), nullable=False, index=True)
    video_id = Column(String, nullable=False, unique=True, index=True)

    # Content
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    tags = Column(JSON, nullable=True)  # list of strings

    # Metrics
    view_count = Column(BigInteger, default=0)
    like_count = Column(BigInteger, default=0)
    comment_count = Column(BigInteger, default=0)
    duration_seconds = Column(Integer, default=0)

    # Timing
    published_at = Column(DateTime(timezone=True), nullable=True)
    published_day_of_week = Column(Integer, nullable=True)  # 0=Mon, 6=Sun
    published_hour = Column(Integer, nullable=True)         # 0-23 UTC

    # Analysis
    performance_tier = Column(String, nullable=True)
    performance_score = Column(Float, nullable=True)
    title_pattern = Column(String, nullable=True)
    duration_bucket = Column(String, nullable=True)
    topic_cluster = Column(String, nullable=True)

    # Thumbnail
    thumbnail_url = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    channel = relationship("Channel", back_populates="videos")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True)  # UUID
    channel_fk = Column(String, ForeignKey("channels.id"), nullable=False, index=True)

    status = Column(String, default=AnalysisStatus.PENDING)
    error_message = Column(Text, nullable=True)
    videos_analyzed = Column(Integer, default=0)

    # JSON result payload
    dna_summary = Column(Text, nullable=True)        # AI-generated paragraph
    patterns = Column(JSON, nullable=True)           # Full pattern analysis dict

    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    channel = relationship("Channel", back_populates="analyses")


class WaitlistEntry(Base):
    __tablename__ = "waitlist"

    id = Column(String, primary_key=True)  # UUID
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
