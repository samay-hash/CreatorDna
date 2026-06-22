"""
Gemini AI Summarizer
Module 5: Topic Clustering + DNA narrative paragraph generation.
Uses Google Gemini 1.5 Flash (free tier).
"""
import json
import re
from typing import Any
import google.generativeai as genai

from app.config import settings


genai.configure(api_key=settings.GEMINI_API_KEY)


class GeminiSummarizer:

    def __init__(self):
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)

    # ─── Module 5: Topic Clustering ─────────────────────────────────────────

    async def cluster_topics(self, videos: list[dict]) -> list[dict]:
        """
        Send video titles to Gemini and ask it to cluster them into
        5-8 meaningful topic categories.
        Returns list of: {name, video_ids, video_count, avg_views, top_video_titles}
        """
        if not videos:
            return []

        # Build title list (max 300 titles to stay within token limits)
        title_list = [
            f"{i+1}. [{v['video_id']}] {v['title']}"
            for i, v in enumerate(videos[:300])
        ]
        titles_text = "\n".join(title_list)

        prompt = f"""You are analyzing a YouTube creator's video library to identify topic clusters.

Here are {len(title_list)} video titles from the channel (format: "index. [videoId] title"):

{titles_text}

Task: Group these videos into exactly 5 to 8 meaningful topic clusters that best represent what this channel covers.

Return ONLY valid JSON in this exact format, no markdown, no explanation:
{{
  "clusters": [
    {{
      "name": "Topic Cluster Name",
      "video_ids": ["videoId1", "videoId2", "videoId3"]
    }}
  ]
}}

Rules:
- Cluster names should be 2-5 words, descriptive and specific
- Every video should belong to exactly one cluster
- Choose clusters that reflect the actual content, not vague categories
- Prioritize clusters based on what you see the most content about"""

        try:
            response = await self.model.generate_content_async(prompt)
            text = response.text.strip()

            # Strip markdown code blocks if present
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)

            data = json.loads(text)
            clusters = data.get("clusters", [])

            # Build video_id → views lookup
            vid_map = {v["video_id"]: v for v in videos}

            result = []
            for cluster in clusters:
                cluster_vid_ids = cluster.get("video_ids", [])
                cluster_videos = [vid_map[vid_id] for vid_id in cluster_vid_ids if vid_id in vid_map]

                if not cluster_videos:
                    continue

                avg_views = sum(v["view_count"] for v in cluster_videos) / len(cluster_videos)
                top_titles = [v["title"] for v in sorted(cluster_videos, key=lambda x: -x["view_count"])[:3]]

                result.append({
                    "name": cluster["name"],
                    "video_count": len(cluster_videos),
                    "avg_views": round(avg_views),
                    "top_video_titles": top_titles,
                })

            # Sort by avg_views descending
            result.sort(key=lambda x: -x["avg_views"])
            return result

        except Exception as e:
            # Fallback: return empty clusters, don't crash analysis
            print(f"[GeminiSummarizer] Topic clustering failed: {e}")
            return []

    # ─── DNA Summary Generation ──────────────────────────────────────────────

    async def generate_dna_summary(
        self,
        channel_info: dict,
        patterns: dict[str, Any],
    ) -> str:
        """
        Generate a 3-5 sentence "Performance DNA" narrative for the creator.
        """
        # Extract key insights to feed to Gemini
        best_title = patterns.get("best_title_pattern", "Unknown")
        best_duration = patterns.get("optimal_duration_range", "Unknown")
        best_day = patterns.get("best_day", "Unknown")
        best_time = patterns.get("best_time_window", "Unknown")
        avg_views = patterns.get("avg_views", 0)
        total_videos = patterns.get("total_videos", 0)
        topic_clusters = patterns.get("topic_clusters", [])
        top_topic = topic_clusters[0]["name"] if topic_clusters else "Unknown"
        keep_doing = patterns.get("keep_doing", [])
        stop_doing = patterns.get("stop_doing", [])

        prompt = f"""You are an expert YouTube growth strategist.

Channel: {channel_info.get('title', 'Unknown')}
Subscribers: {channel_info.get('subscriber_count', 0):,}
Total videos analyzed: {total_videos}
Average views per video: {avg_views:,}

Key patterns discovered:
- Best performing title style: {best_title}
- Optimal video duration: {best_duration}
- Best upload day: {best_day}
- Best upload time: {best_time}
- Top performing topic: {top_topic}
- What's working: {', '.join(keep_doing[:2]) if keep_doing else 'N/A'}
- What's underperforming: {', '.join(stop_doing[:2]) if stop_doing else 'N/A'}

Write a 3-5 sentence "Creator Performance DNA" summary for this creator.
- Be direct, specific, and actionable
- Sound like a senior growth consultant, not a robot
- Start with the most impactful insight
- Use plain English, no jargon
- Do NOT use bullet points or headers, just flowing paragraphs
- Keep it under 100 words"""

        try:
            response = await self.model.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"[GeminiSummarizer] DNA summary failed: {e}")
            return (
                f"{channel_info.get('title', 'This channel')}'s content performs best with "
                f"{best_title} style titles, {best_duration} videos published on {best_day}s. "
                f"The strongest topic area is {top_topic}, which drives the most engagement."
            )


# Singleton
_summarizer: GeminiSummarizer | None = None


def get_summarizer() -> GeminiSummarizer:
    global _summarizer
    if _summarizer is None:
        _summarizer = GeminiSummarizer()
    return _summarizer
