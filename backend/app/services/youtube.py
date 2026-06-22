
"""
YouTube Data API v3 Client
Handles channel resolution, video fetching, and statistics.
"""
import httpx
import re
import isodate
from typing import Optional, AsyncGenerator
from datetime import datetime

from app.config import settings


YOUTUBE_BASE = "https://www.googleapis.com/youtube/v3"


class YouTubeAPIError(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class YouTubeClient:
    def __init__(self):
        self.api_key = settings.YOUTUBE_API_KEY
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        await self.client.aclose()

    # ─── Channel Resolution ─────────────────────────────────────────────────

    async def resolve_channel_id(self, url_or_handle: str) -> str:
        """
        Resolves various YouTube URL formats and handles to a channel_id.
        Supports:
          - https://youtube.com/@handle
          - https://youtube.com/channel/UCxxxxxx
          - https://youtube.com/user/username
          - @handle (bare handle)
          - UCxxxxx (raw channel ID)
        """
        url = url_or_handle.strip().rstrip("/")

        # Raw channel ID
        if re.match(r"^UC[a-zA-Z0-9_-]{22}$", url):
            return url

        # Bare handle @handle
        if re.match(r"^@[\w.-]+$", url):
            return await self._handle_to_channel_id(url[1:])

        # Extract from URL
        if "youtube.com" in url:
            # /channel/UCxxxxxxx
            m = re.search(r"/channel/(UC[a-zA-Z0-9_-]{22})", url)
            if m:
                return m.group(1)

            # /@handle
            m = re.search(r"/@([\w.-]+)", url)
            if m:
                return await self._handle_to_channel_id(m.group(1))

            # /user/username
            m = re.search(r"/user/([\w.-]+)", url)
            if m:
                return await self._username_to_channel_id(m.group(1))

            # /c/customname
            m = re.search(r"/c/([\w.-]+)", url)
            if m:
                return await self._handle_to_channel_id(m.group(1))

        raise YouTubeAPIError(
            "Could not resolve channel from the provided URL. "
            "Please use a format like: https://youtube.com/@handle or https://youtube.com/channel/UCxxxxxx",
            status_code=400,
        )

    async def _handle_to_channel_id(self, handle: str) -> str:
        resp = await self.client.get(
            f"{YOUTUBE_BASE}/channels",
            params={
                "part": "id",
                "forHandle": handle,
                "key": self.api_key,
            },
        )
        data = resp.json()
        if resp.status_code != 200:
            raise YouTubeAPIError(f"YouTube API error: {data.get('error', {}).get('message', 'Unknown error')}")
        items = data.get("items", [])
        if not items:
            raise YouTubeAPIError(f"No channel found for handle @{handle}", status_code=404)
        return items[0]["id"]

    async def _username_to_channel_id(self, username: str) -> str:
        resp = await self.client.get(
            f"{YOUTUBE_BASE}/channels",
            params={
                "part": "id",
                "forUsername": username,
                "key": self.api_key,
            },
        )
        data = resp.json()
        if resp.status_code != 200:
            raise YouTubeAPIError(f"YouTube API error: {data.get('error', {}).get('message', 'Unknown error')}")
        items = data.get("items", [])
        if not items:
            raise YouTubeAPIError(f"No channel found for username {username}", status_code=404)
        return items[0]["id"]

    # ─── Channel Info ───────────────────────────────────────────────────────

    async def get_channel_info(self, channel_id: str) -> dict:
        """Fetch full channel metadata."""
        resp = await self.client.get(
            f"{YOUTUBE_BASE}/channels",
            params={
                "part": "snippet,statistics,contentDetails",
                "id": channel_id,
                "key": self.api_key,
            },
        )
        data = resp.json()
        if resp.status_code != 200:
            raise YouTubeAPIError(f"YouTube API error: {data.get('error', {}).get('message', 'Unknown error')}")

        items = data.get("items", [])
        if not items:
            raise YouTubeAPIError(f"Channel not found: {channel_id}", status_code=404)

        item = items[0]
        snippet = item.get("snippet", {})
        stats = item.get("statistics", {})
        content = item.get("contentDetails", {})

        thumbnails = snippet.get("thumbnails", {})
        thumbnail = (
            thumbnails.get("high", {}).get("url")
            or thumbnails.get("medium", {}).get("url")
            or thumbnails.get("default", {}).get("url")
        )

        return {
            "channel_id": channel_id,
            "title": snippet.get("title", ""),
            "description": snippet.get("description", ""),
            "thumbnail_url": thumbnail,
            "subscriber_count": int(stats.get("subscriberCount", 0)),
            "video_count": int(stats.get("videoCount", 0)),
            "view_count": int(stats.get("viewCount", 0)),
            "country": snippet.get("country"),
            "uploads_playlist_id": content.get("relatedPlaylists", {}).get("uploads"),
        }

    # ─── Video Fetching ─────────────────────────────────────────────────────

    async def get_all_video_ids(self, uploads_playlist_id: str) -> list[str]:
        """Paginate through the uploads playlist and collect all video IDs."""
        video_ids = []
        next_page_token = None

        while len(video_ids) < settings.MAX_VIDEOS_TO_FETCH:
            params = {
                "part": "contentDetails",
                "playlistId": uploads_playlist_id,
                "maxResults": 50,
                "key": self.api_key,
            }
            if next_page_token:
                params["pageToken"] = next_page_token

            resp = await self.client.get(f"{YOUTUBE_BASE}/playlistItems", params=params)
            data = resp.json()

            if resp.status_code != 200:
                break

            items = data.get("items", [])
            for item in items:
                vid_id = item.get("contentDetails", {}).get("videoId")
                if vid_id:
                    video_ids.append(vid_id)

            next_page_token = data.get("nextPageToken")
            if not next_page_token:
                break

        return video_ids[: settings.MAX_VIDEOS_TO_FETCH]

    async def get_video_details_batch(self, video_ids: list[str]) -> list[dict]:
        """Fetch full details for up to 50 videos at once."""
        if not video_ids:
            return []

        resp = await self.client.get(
            f"{YOUTUBE_BASE}/videos",
            params={
                "part": "snippet,statistics,contentDetails",
                "id": ",".join(video_ids),
                "key": self.api_key,
            },
        )
        data = resp.json()
        if resp.status_code != 200:
            return []

        results = []
        for item in data.get("items", []):
            snippet = item.get("snippet", {})
            stats = item.get("statistics", {})
            content = item.get("contentDetails", {})

            # Parse duration (ISO 8601)
            duration_str = content.get("duration", "PT0S")
            try:
                duration_seconds = int(isodate.parse_duration(duration_str).total_seconds())
            except Exception:
                duration_seconds = 0

            # Parse published date
            published_raw = snippet.get("publishedAt", "")
            try:
                published_at = datetime.fromisoformat(published_raw.replace("Z", "+00:00"))
            except Exception:
                published_at = None

            thumbnails = snippet.get("thumbnails", {})
            thumbnail = (
                thumbnails.get("maxres", {}).get("url")
                or thumbnails.get("high", {}).get("url")
                or thumbnails.get("medium", {}).get("url")
            )

            results.append({
                "video_id": item["id"],
                "title": snippet.get("title", ""),
                "description": snippet.get("description", "")[:2000],
                "tags": snippet.get("tags", []),
                "view_count": int(stats.get("viewCount", 0)),
                "like_count": int(stats.get("likeCount", 0)),
                "comment_count": int(stats.get("commentCount", 0)),
                "duration_seconds": duration_seconds,
                "published_at": published_at,
                "published_day_of_week": published_at.weekday() if published_at else None,
                "published_hour": published_at.hour if published_at else None,
                "thumbnail_url": thumbnail,
            })

        return results

    async def fetch_all_videos(
        self, uploads_playlist_id: str
    ) -> AsyncGenerator[list[dict], None]:
        """
        Async generator that yields batches of video detail dicts.
        Yields after every 50 videos fetched.
        """
        video_ids = await self.get_all_video_ids(uploads_playlist_id)

        for i in range(0, len(video_ids), settings.YOUTUBE_BATCH_SIZE):
            batch_ids = video_ids[i: i + settings.YOUTUBE_BATCH_SIZE]
            batch_details = await self.get_video_details_batch(batch_ids)
            yield batch_details


# Module-level singleton
_youtube_client: Optional[YouTubeClient] = None


def get_youtube_client() -> YouTubeClient:
    global _youtube_client
    if _youtube_client is None:
        _youtube_client = YouTubeClient()
    return _youtube_client
