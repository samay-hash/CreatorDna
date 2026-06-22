from pydantic import BaseModel, HttpUrl, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime


# ─────────────────────────────────────────────
# Request Schemas
# ─────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    channel_url: str

    @field_validator("channel_url")
    @classmethod
    def validate_channel_url(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Channel URL cannot be empty")
        return v


# ─────────────────────────────────────────────
# Channel Schemas
# ─────────────────────────────────────────────

class ChannelBase(BaseModel):
    channel_id: str
    title: str
    thumbnail_url: Optional[str] = None
    subscriber_count: int = 0
    video_count: int = 0

class ChannelResponse(ChannelBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# Video Schemas
# ─────────────────────────────────────────────

class VideoSummary(BaseModel):
    video_id: str
    title: str
    view_count: int
    like_count: int
    duration_seconds: int
    published_at: Optional[datetime]
    thumbnail_url: Optional[str]
    performance_tier: Optional[str]
    title_pattern: Optional[str]
    duration_bucket: Optional[str]
    topic_cluster: Optional[str]

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# Pattern Analysis Schemas
# ─────────────────────────────────────────────

class TitlePatternDetail(BaseModel):
    count: int
    avg_views: float
    examples: List[str] = []


class DurationBucket(BaseModel):
    label: str
    count: int
    avg_views: float


class DayPerformance(BaseModel):
    day: str
    avg_views: float
    count: int


class TopicCluster(BaseModel):
    name: str
    video_count: int
    avg_views: float
    top_video_titles: List[str] = []


class PatternResult(BaseModel):
    # Module 1
    total_videos: int
    avg_views: float
    top_performers: List[VideoSummary] = []
    under_performers: List[VideoSummary] = []

    # Module 2 - Title
    best_title_pattern: str
    best_title_avg_views: float
    title_patterns: Dict[str, TitlePatternDetail] = {}

    # Module 3 - Duration
    optimal_duration_range: str
    optimal_duration_avg_views: float
    duration_buckets: List[DurationBucket] = []

    # Module 4 - Timing
    best_day: str
    best_time_window: str
    day_performance: List[DayPerformance] = []

    # Module 5 - Topics
    topic_clusters: List[TopicCluster] = []

    # Module 6 - Repetition
    keep_doing: List[str] = []
    stop_doing: List[str] = []


# ─────────────────────────────────────────────
# Analysis Schemas
# ─────────────────────────────────────────────

class AnalysisStartResponse(BaseModel):
    analysis_id: str
    channel_id: str
    message: str = "Analysis started"


class AnalysisResponse(BaseModel):
    id: str
    status: str
    channel: Optional[ChannelResponse] = None
    dna_summary: Optional[str] = None
    patterns: Optional[PatternResult] = None
    videos_analyzed: int = 0
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─────────────────────────────────────────────
# SSE Progress Event
# ─────────────────────────────────────────────

class ProgressEvent(BaseModel):
    step: str
    module: str
    progress: int  # 0-100
    message: str
    done: bool = False
    error: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


# ─────────────────────────────────────────────
# Waitlist Schemas
# ─────────────────────────────────────────────

class WaitlistCreate(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not v or "@" not in v:
            raise ValueError("Invalid email address")
        return v

class WaitlistResponse(BaseModel):
    message: str
    count: int

class WaitlistCountResponse(BaseModel):
    count: int
