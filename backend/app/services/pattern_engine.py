"""
Pattern Engine — 6 Analysis Modules

Module 1: Performance Tier Classification
Module 2: Title Pattern Analysis
Module 3: Duration Sweet Spot
Module 4: Upload Timing Analysis
Module 5: Topic Clustering (via AI)
Module 6: Content Repetition Detection
"""
import re
import statistics
from collections import defaultdict
from typing import Any
from datetime import datetime


DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

TITLE_PATTERNS = {
    "how_to": {
        "label": "How-To",
        "regex": re.compile(r"^how\s+to\b", re.IGNORECASE),
    },
    "question": {
        "label": "Question",
        "regex": re.compile(
            r"^(why|what|when|where|who|can|is|are|did|do|does|which|will|would|should|has|have)\b",
            re.IGNORECASE,
        ),
    },
    "number_list": {
        "label": "Number / List",
        "regex": re.compile(
            r"^\d+\s|\b\d+\s+(ways|tips|tricks|things|mistakes|reasons|steps|secrets|hacks)\b",
            re.IGNORECASE,
        ),
    },
    "curiosity": {
        "label": "Curiosity / Story",
        "regex": re.compile(
            r"\b(i\s+(tried|spent|built|made|tested|used|watched|lived|ate)|this\s+changed|"
            r"i\s+can'?t\s+believe|you\s+won'?t\s+believe|the\s+truth|exposed)\b",
            re.IGNORECASE,
        ),
    },
    "power_word": {
        "label": "Power Word",
        "regex": re.compile(
            r"\b(secret|never|only|actually|finally|ultimate|instantly|immediately|"
            r"shocking|insane|crazy|unbelievable|epic|legendary|perfect|best|worst|"
            r"honest|brutal|raw|real|truth|revealed|exposed|warning)\b",
            re.IGNORECASE,
        ),
    },
}

DURATION_BUCKETS = [
    ("0–3 min", 0, 180),
    ("3–8 min", 181, 480),
    ("8–15 min", 481, 900),
    ("15–30 min", 901, 1800),
    ("30+ min", 1801, float("inf")),
]

HOUR_WINDOWS = [
    ("Midnight–6 AM", 0, 6),
    ("6 AM–12 PM", 6, 12),
    ("12 PM–6 PM", 12, 18),
    ("6 PM–Midnight", 18, 24),
]


class PatternEngine:
    """
    Runs all 6 pattern analysis modules on a list of video dicts.
    Returns a unified result dict.
    """

    def analyze(self, videos: list[dict]) -> dict[str, Any]:
        if not videos:
            return {}

        # Compute performance scores
        videos = self._compute_performance_scores(videos)

        result = {}
        result.update(self._module1_performance(videos))
        result.update(self._module2_titles(videos))
        result.update(self._module3_duration(videos))
        result.update(self._module4_timing(videos))
        result.update(self._module6_repetition(videos))

        return result

    # ─── Helpers ────────────────────────────────────────────────────────────

    def _compute_performance_scores(self, videos: list[dict]) -> list[dict]:
        """
        Normalize view counts into a 0-100 performance score.
        Assigns performance_tier: top / average / under
        """
        view_counts = [v["view_count"] for v in videos if v["view_count"] > 0]
        if not view_counts:
            return videos

        max_views = max(view_counts)
        if max_views == 0:
            return videos

        sorted_views = sorted(view_counts)
        p20 = sorted_views[int(len(sorted_views) * 0.2)]
        p80 = sorted_views[int(len(sorted_views) * 0.8)]

        for v in videos:
            score = (v["view_count"] / max_views) * 100
            v["performance_score"] = round(score, 2)

            if v["view_count"] >= p80:
                v["performance_tier"] = "top"
            elif v["view_count"] <= p20:
                v["performance_tier"] = "under"
            else:
                v["performance_tier"] = "average"

        return videos

    def _detect_title_pattern(self, title: str) -> str:
        for key, pattern in TITLE_PATTERNS.items():
            if pattern["regex"].search(title):
                return key
        return "general"

    def _get_duration_bucket(self, seconds: int) -> str:
        for label, low, high in DURATION_BUCKETS:
            if low <= seconds <= high:
                return label
        return "30+ min"

    # ─── Module 1: Performance Tiers ────────────────────────────────────────

    def _module1_performance(self, videos: list[dict]) -> dict:
        top = [v for v in videos if v.get("performance_tier") == "top"]
        under = [v for v in videos if v.get("performance_tier") == "under"]

        all_views = [v["view_count"] for v in videos]
        avg_views = statistics.mean(all_views) if all_views else 0

        # Sort top by views descending, under by views ascending
        top_sorted = sorted(top, key=lambda x: x["view_count"], reverse=True)[:10]
        under_sorted = sorted(under, key=lambda x: x["view_count"])[:10]

        return {
            "total_videos": len(videos),
            "avg_views": round(avg_views),
            "top_performers": top_sorted,
            "under_performers": under_sorted,
        }

    # ─── Module 2: Title Patterns ────────────────────────────────────────────

    def _module2_titles(self, videos: list[dict]) -> dict:
        buckets: dict[str, list[int]] = defaultdict(list)
        pattern_examples: dict[str, list[str]] = defaultdict(list)

        for v in videos:
            pattern = self._detect_title_pattern(v["title"])
            v["title_pattern"] = pattern
            buckets[pattern].append(v["view_count"])
            if len(pattern_examples[pattern]) < 3:
                pattern_examples[pattern].append(v["title"])

        title_patterns: dict[str, dict] = {}
        for key, views in buckets.items():
            label = TITLE_PATTERNS.get(key, {}).get("label", key.replace("_", " ").title())
            avg = statistics.mean(views) if views else 0
            title_patterns[key] = {
                "label": label,
                "count": len(views),
                "avg_views": round(avg),
                "examples": pattern_examples[key],
            }

        best_pattern = max(title_patterns, key=lambda k: title_patterns[k]["avg_views"], default="general")
        best_detail = title_patterns.get(best_pattern, {})

        return {
            "best_title_pattern": best_detail.get("label", best_pattern),
            "best_title_avg_views": best_detail.get("avg_views", 0),
            "title_patterns": title_patterns,
        }

    # ─── Module 3: Duration ──────────────────────────────────────────────────

    def _module3_duration(self, videos: list[dict]) -> dict:
        buckets: dict[str, list[int]] = defaultdict(list)

        for v in videos:
            bucket = self._get_duration_bucket(v.get("duration_seconds", 0))
            v["duration_bucket"] = bucket
            buckets[bucket].append(v["view_count"])

        duration_buckets = []
        for label, _, __ in DURATION_BUCKETS:
            views = buckets.get(label, [])
            avg = statistics.mean(views) if views else 0
            duration_buckets.append({
                "label": label,
                "count": len(views),
                "avg_views": round(avg),
            })

        best_bucket = max(duration_buckets, key=lambda x: x["avg_views"], default={"label": "Unknown", "avg_views": 0})

        return {
            "optimal_duration_range": best_bucket["label"],
            "optimal_duration_avg_views": best_bucket["avg_views"],
            "duration_buckets": duration_buckets,
        }

    # ─── Module 4: Upload Timing ─────────────────────────────────────────────

    def _module4_timing(self, videos: list[dict]) -> dict:
        day_views: dict[int, list[int]] = defaultdict(list)
        hour_views: dict[int, list[int]] = defaultdict(list)

        for v in videos:
            dow = v.get("published_day_of_week")
            hour = v.get("published_hour")
            views = v["view_count"]
            if dow is not None:
                day_views[dow].append(views)
            if hour is not None:
                hour_views[hour].append(views)

        day_performance = []
        for day_idx in range(7):
            views = day_views.get(day_idx, [])
            avg = statistics.mean(views) if views else 0
            day_performance.append({
                "day": DAYS[day_idx],
                "avg_views": round(avg),
                "count": len(views),
            })

        best_day_data = max(day_performance, key=lambda x: x["avg_views"], default={"day": "Unknown"})
        best_day = best_day_data["day"]

        # Best time window
        best_window = "Unknown"
        best_window_avg = 0
        for window_label, h_start, h_end in HOUR_WINDOWS:
            window_views: list[int] = []
            for h, views in hour_views.items():
                if h_start <= h < h_end:
                    window_views.extend(views)
            avg = statistics.mean(window_views) if window_views else 0
            if avg > best_window_avg:
                best_window_avg = avg
                best_window = window_label

        return {
            "best_day": best_day,
            "best_time_window": best_window,
            "day_performance": day_performance,
        }

    # ─── Module 6: Repetition Detection ─────────────────────────────────────

    def _module6_repetition(self, videos: list[dict]) -> dict:
        """
        Identifies repeated patterns/formats and maps them to performance.
        """
        # Pattern performance: what title patterns are top vs under
        top_patterns: dict[str, int] = defaultdict(int)
        under_patterns: dict[str, int] = defaultdict(int)

        for v in videos:
            tier = v.get("performance_tier")
            pattern = v.get("title_pattern", "general")
            if tier == "top":
                top_patterns[pattern] += 1
            elif tier == "under":
                under_patterns[pattern] += 1

        # "Keep doing": patterns that appear frequently in top performers
        keep_doing = []
        for pattern, count in sorted(top_patterns.items(), key=lambda x: -x[1]):
            if count >= 3:
                label = TITLE_PATTERNS.get(pattern, {}).get("label", pattern.replace("_", " ").title())
                keep_doing.append(f"{label} titles (appears in {count} top videos)")

        # "Stop doing": patterns that appear frequently in under performers but rarely in top
        stop_doing = []
        for pattern, count in sorted(under_patterns.items(), key=lambda x: -x[1]):
            if count >= 3 and top_patterns.get(pattern, 0) < count:
                label = TITLE_PATTERNS.get(pattern, {}).get("label", pattern.replace("_", " ").title())
                stop_doing.append(f"{label} titles (appears in {count} under-performing videos)")

        return {
            "keep_doing": keep_doing[:5],
            "stop_doing": stop_doing[:5],
        }
