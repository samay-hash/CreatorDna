"""
Analysis API Routes
POST /api/v1/analyze          — Start a new channel analysis
GET  /api/v1/analysis/{id}    — Get full analysis result
GET  /api/v1/analysis/{id}/stream — SSE progress stream
"""
import uuid
import json
import asyncio
from datetime import datetime, timezone
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Channel, Video, Analysis
from app.schemas import AnalyzeRequest, AnalysisStartResponse, AnalysisResponse, PatternResult
from app.services.youtube import get_youtube_client, YouTubeAPIError
from app.services.pattern_engine import PatternEngine
from app.services.ai_summarizer import get_summarizer

router = APIRouter(prefix="/api/v1", tags=["analysis"])

# ─── In-memory progress store (per analysis run) ─────────────────────────────
# In production this would be Redis pub/sub
_progress_queues: dict[str, asyncio.Queue] = {}


def _emit(queue: asyncio.Queue, step: str, module: str, progress: int, message: str, **kwargs):
    """Helper to push a progress event onto the queue."""
    event = {
        "step": step,
        "module": module,
        "progress": progress,
        "message": message,
        "done": False,
        **kwargs,
    }
    queue.put_nowait(event)


# ─── POST /api/v1/analyze ────────────────────────────────────────────────────

@router.post("/analyze", response_model=AnalysisStartResponse)
async def start_analysis(
    request: AnalyzeRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Resolve the channel URL, create DB records, return analysis_id.
    The actual analysis is driven by the SSE stream endpoint.
    """
    yt = get_youtube_client()

    # 1. Resolve channel ID
    try:
        channel_id = await yt.resolve_channel_id(request.channel_url)
    except YouTubeAPIError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

    # 2. Check if channel already exists (reuse or create)
    stmt = select(Channel).where(Channel.channel_id == channel_id)
    result = await db.execute(stmt)
    channel = result.scalar_one_or_none()

    if channel is None:
        # Get basic info first so we have a title to return
        try:
            ch_info = await yt.get_channel_info(channel_id)
        except YouTubeAPIError as e:
            raise HTTPException(status_code=e.status_code, detail=e.message)

        channel = Channel(
            id=str(uuid.uuid4()),
            channel_id=channel_id,
            title=ch_info["title"],
            description=ch_info.get("description", ""),
            thumbnail_url=ch_info.get("thumbnail_url"),
            subscriber_count=ch_info.get("subscriber_count", 0),
            video_count=ch_info.get("video_count", 0),
            view_count=ch_info.get("view_count", 0),
            country=ch_info.get("country"),
        )
        db.add(channel)
        await db.flush()

    # 3. Create analysis record
    analysis_id = str(uuid.uuid4())
    analysis = Analysis(
        id=analysis_id,
        channel_fk=channel.id,
        status="pending",
    )
    db.add(analysis)
    await db.commit()

    # 4. Create a progress queue for this analysis
    _progress_queues[analysis_id] = asyncio.Queue()

    return AnalysisStartResponse(
        analysis_id=analysis_id,
        channel_id=channel_id,
        message="Analysis created. Connect to /stream to begin.",
    )


# ─── GET /api/v1/analysis/{id}/stream ────────────────────────────────────────

@router.get("/analysis/{analysis_id}/stream")
async def stream_analysis(
    analysis_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    SSE endpoint. Drives the full analysis pipeline and streams progress events.
    """
    # Verify analysis exists
    stmt = select(Analysis).where(Analysis.id == analysis_id).options(
        selectinload(Analysis.channel)
    )
    result = await db.execute(stmt)
    analysis = result.scalar_one_or_none()

    if analysis is None:
        raise HTTPException(status_code=404, detail="Analysis not found")

    if analysis.status == "complete":
        # Already done — stream a single completion event
        async def already_done():
            yield _sse({"step": "complete", "module": "done", "progress": 100, "message": "Analysis already complete", "done": True})
        return StreamingResponse(already_done(), media_type="text/event-stream", headers=_sse_headers())

    channel = analysis.channel
    queue = _progress_queues.get(analysis_id)
    if queue is None:
        queue = asyncio.Queue()
        _progress_queues[analysis_id] = queue

    async def run_and_stream() -> AsyncGenerator[str, None]:
        yt = get_youtube_client()
        engine = PatternEngine()
        summarizer = get_summarizer()

        try:
            # ── Update status to fetching ──────────────────────────────────
            await _update_status(db, analysis_id, "fetching")
            yield _sse({"step": "fetch_channel", "module": "youtube", "progress": 5,
                        "message": f"Connected to {channel.title}", "done": False})

            # ── Fetch channel info (refresh) ───────────────────────────────
            try:
                ch_info = await yt.get_channel_info(channel.channel_id)
            except YouTubeAPIError as e:
                yield _sse({"step": "error", "module": "youtube", "progress": 0, "message": str(e), "done": True, "error": str(e)})
                await _update_status(db, analysis_id, "failed", error=str(e))
                return

            uploads_id = ch_info.get("uploads_playlist_id")
            if not uploads_id:
                yield _sse({"step": "error", "module": "youtube", "progress": 0,
                            "message": "Could not find uploads playlist", "done": True, "error": "No uploads playlist"})
                await _update_status(db, analysis_id, "failed", error="No uploads playlist")
                return

            # ── Fetch videos ───────────────────────────────────────────────
            yield _sse({"step": "fetch_videos", "module": "youtube", "progress": 10,
                        "message": "Fetching video library...", "done": False})

            all_videos: list[dict] = []
            video_ids_seen: set[str] = set()
            batch_num = 0

            async for batch in yt.fetch_all_videos(uploads_id):
                batch_num += 1
                for v in batch:
                    if v["video_id"] not in video_ids_seen:
                        all_videos.append(v)
                        video_ids_seen.add(v["video_id"])

                progress = min(10 + (len(all_videos) / max(ch_info["video_count"], 1)) * 40, 50)
                yield _sse({
                    "step": "fetch_videos",
                    "module": "youtube",
                    "progress": int(progress),
                    "message": f"Fetched {len(all_videos)} videos...",
                    "done": False,
                })
                # Small delay to let SSE flush
                await asyncio.sleep(0.05)

            yield _sse({"step": "fetch_complete", "module": "youtube", "progress": 50,
                        "message": f"Fetched {len(all_videos)} videos. Starting pattern analysis...", "done": False})

            # ── Store videos in DB ─────────────────────────────────────────
            await _upsert_videos(db, channel.id, all_videos)

            # ── Run Pattern Engine ─────────────────────────────────────────
            await _update_status(db, analysis_id, "analyzing")

            yield _sse({"step": "module_1", "module": "performance", "progress": 55,
                        "message": "Module 1: Classifying top & under-performers...", "done": False})
            await asyncio.sleep(0.1)

            patterns = engine.analyze(all_videos)

            yield _sse({"step": "module_2", "module": "titles", "progress": 60,
                        "message": "Module 2: Analyzing title patterns...", "done": False})
            await asyncio.sleep(0.1)

            yield _sse({"step": "module_3", "module": "duration", "progress": 65,
                        "message": "Module 3: Finding duration sweet spots...", "done": False})
            await asyncio.sleep(0.1)

            yield _sse({"step": "module_4", "module": "timing", "progress": 70,
                        "message": "Module 4: Analyzing upload timing...", "done": False})
            await asyncio.sleep(0.1)

            # ── Module 5: AI Topic Clustering ──────────────────────────────
            yield _sse({"step": "module_5", "module": "topics", "progress": 75,
                        "message": "Module 5: AI clustering video topics...", "done": False})

            topic_clusters = await summarizer.cluster_topics(all_videos)
            patterns["topic_clusters"] = topic_clusters

            # Assign topic_cluster back to videos
            for cluster in topic_clusters:
                for title in cluster.get("top_video_titles", []):
                    for v in all_videos:
                        if v["title"] == title:
                            v["topic_cluster"] = cluster["name"]

            yield _sse({"step": "module_6", "module": "repetition", "progress": 85,
                        "message": "Module 6: Detecting content repetition patterns...", "done": False})
            await asyncio.sleep(0.1)

            # ── Generate DNA Summary ───────────────────────────────────────
            yield _sse({"step": "dna_summary", "module": "ai", "progress": 90,
                        "message": "Generating your Creator DNA summary...", "done": False})

            dna_summary = await summarizer.generate_dna_summary(ch_info, patterns)

            # ── Save to DB ─────────────────────────────────────────────────
            yield _sse({"step": "saving", "module": "db", "progress": 95,
                        "message": "Saving results...", "done": False})

            await _save_analysis(db, analysis_id, channel.id, len(all_videos), dna_summary, patterns)

            # ── Done ───────────────────────────────────────────────────────
            yield _sse({
                "step": "complete",
                "module": "done",
                "progress": 100,
                "message": "Analysis complete!",
                "done": True,
                "data": {
                    "analysis_id": analysis_id,
                    "videos_analyzed": len(all_videos),
                    "channel_title": channel.title,
                }
            })

        except Exception as e:
            error_msg = str(e)
            print(f"[Analysis {analysis_id}] Fatal error: {error_msg}")
            await _update_status(db, analysis_id, "failed", error=error_msg)
            yield _sse({"step": "error", "module": "unknown", "progress": 0,
                        "message": f"Analysis failed: {error_msg}", "done": True, "error": error_msg})
        finally:
            _progress_queues.pop(analysis_id, None)

    return StreamingResponse(
        run_and_stream(),
        media_type="text/event-stream",
        headers=_sse_headers(),
    )


# ─── GET /api/v1/analysis/{id} ───────────────────────────────────────────────

@router.get("/analysis/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Return the stored analysis result."""
    stmt = select(Analysis).where(Analysis.id == analysis_id).options(
        selectinload(Analysis.channel)
    )
    result = await db.execute(stmt)
    analysis = result.scalar_one_or_none()

    if analysis is None:
        raise HTTPException(status_code=404, detail="Analysis not found")

    channel = analysis.channel
    channel_resp = {
        "id": channel.id,
        "channel_id": channel.channel_id,
        "title": channel.title,
        "thumbnail_url": channel.thumbnail_url,
        "subscriber_count": channel.subscriber_count,
        "video_count": channel.video_count,
        "created_at": channel.created_at,
    } if channel else None

    # Deserialize patterns JSON
    patterns = None
    if analysis.patterns:
        try:
            patterns_data = analysis.patterns
            # Build PatternResult (exclude nested complex types for now)
            patterns = PatternResult(
                total_videos=patterns_data.get("total_videos", 0),
                avg_views=patterns_data.get("avg_views", 0),
                top_performers=patterns_data.get("top_performers", [])[:10],
                under_performers=patterns_data.get("under_performers", [])[:10],
                best_title_pattern=patterns_data.get("best_title_pattern", ""),
                best_title_avg_views=patterns_data.get("best_title_avg_views", 0),
                title_patterns=patterns_data.get("title_patterns", {}),
                optimal_duration_range=patterns_data.get("optimal_duration_range", ""),
                optimal_duration_avg_views=patterns_data.get("optimal_duration_avg_views", 0),
                duration_buckets=patterns_data.get("duration_buckets", []),
                best_day=patterns_data.get("best_day", ""),
                best_time_window=patterns_data.get("best_time_window", ""),
                day_performance=patterns_data.get("day_performance", []),
                topic_clusters=patterns_data.get("topic_clusters", []),
                keep_doing=patterns_data.get("keep_doing", []),
                stop_doing=patterns_data.get("stop_doing", []),
            )
        except Exception as e:
            print(f"[get_analysis] Failed to deserialize patterns: {e}")

    return AnalysisResponse(
        id=analysis.id,
        status=analysis.status,
        channel=channel_resp,
        dna_summary=analysis.dna_summary,
        patterns=patterns,
        videos_analyzed=analysis.videos_analyzed,
        error_message=analysis.error_message,
        started_at=analysis.started_at,
        completed_at=analysis.completed_at,
    )


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


def _sse_headers() -> dict:
    return {
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
        "Connection": "keep-alive",
    }


async def _update_status(db: AsyncSession, analysis_id: str, status: str, error: str | None = None):
    stmt = select(Analysis).where(Analysis.id == analysis_id)
    result = await db.execute(stmt)
    analysis = result.scalar_one_or_none()
    if analysis:
        analysis.status = status
        if error:
            analysis.error_message = error
        if status == "complete":
            analysis.completed_at = datetime.now(timezone.utc)
        await db.commit()


async def _upsert_videos(db: AsyncSession, channel_id: str, videos: list[dict]):
    """Insert or update video records."""
    for v in videos:
        stmt = select(Video).where(Video.video_id == v["video_id"])
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            existing.view_count = v["view_count"]
            existing.like_count = v["like_count"]
            existing.comment_count = v["comment_count"]
            existing.performance_tier = v.get("performance_tier")
            existing.title_pattern = v.get("title_pattern")
            existing.duration_bucket = v.get("duration_bucket")
            existing.topic_cluster = v.get("topic_cluster")
        else:
            new_vid = Video(
                id=str(uuid.uuid4()),
                channel_fk=channel_id,
                video_id=v["video_id"],
                title=v["title"],
                description=v.get("description", ""),
                tags=v.get("tags", []),
                view_count=v["view_count"],
                like_count=v["like_count"],
                comment_count=v["comment_count"],
                duration_seconds=v.get("duration_seconds", 0),
                published_at=v.get("published_at"),
                published_day_of_week=v.get("published_day_of_week"),
                published_hour=v.get("published_hour"),
                thumbnail_url=v.get("thumbnail_url"),
                performance_tier=v.get("performance_tier"),
                title_pattern=v.get("title_pattern"),
                duration_bucket=v.get("duration_bucket"),
                topic_cluster=v.get("topic_cluster"),
            )
            db.add(new_vid)

    await db.commit()


async def _save_analysis(
    db: AsyncSession,
    analysis_id: str,
    channel_id: str,
    videos_analyzed: int,
    dna_summary: str,
    patterns: dict,
):
    """Persist final analysis results to the DB."""
    stmt = select(Analysis).where(Analysis.id == analysis_id)
    result = await db.execute(stmt)
    analysis = result.scalar_one_or_none()

    if analysis:
        analysis.status = "complete"
        analysis.videos_analyzed = videos_analyzed
        analysis.dna_summary = dna_summary
        analysis.patterns = _make_json_safe(patterns)
        analysis.completed_at = datetime.now(timezone.utc)
        await db.commit()


def _make_json_safe(obj):
    """Recursively convert non-serializable types (datetime, etc.) to strings."""
    if isinstance(obj, dict):
        return {k: _make_json_safe(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_make_json_safe(v) for v in obj]
    elif isinstance(obj, datetime):
        return obj.isoformat()
    else:
        return obj
