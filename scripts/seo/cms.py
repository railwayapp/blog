"""Shared helpers for the SEO content-fix scripts.

Read/write client for the Railway CMS plus markdown-aware string
replacement: replacements never touch fenced code blocks or inline code,
because URLs there (config samples, CLI output) are functional content.
"""
import difflib
import json
import os
import re
import urllib.parse
import urllib.request

CMS_URL = os.environ.get("CMS_API_URL", "https://cms.railway.com")


def _api_key() -> str:
    key = os.environ.get("CMS_API_KEY")
    if not key and os.path.exists(".env.local"):
        for line in open(".env.local"):
            if line.startswith("CMS_API_KEY="):
                key = line.split("=", 1)[1].strip().strip('"').strip("'")
    if not key:
        raise SystemExit("CMS_API_KEY not found (env or .env.local)")
    return key


def request(method: str, path: str, body: dict | None = None) -> dict:
    req = urllib.request.Request(
        CMS_URL + path,
        method=method,
        headers={
            "Authorization": f"Bearer {_api_key()}",
            "Content-Type": "application/json",
        },
        data=json.dumps(body).encode() if body is not None else None,
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def get_post(slug: str) -> dict:
    docs = request(
        "GET", f"/api/posts?where[slug][equals]={urllib.parse.quote(slug)}&limit=1&depth=0"
    )["docs"]
    if not docs:
        raise SystemExit(f"post not found: {slug}")
    return docs[0]


def all_posts() -> list[dict]:
    docs, page = [], 1
    while True:
        d = request("GET", f"/api/posts?limit=100&page={page}&depth=0")
        docs += d["docs"]
        if not d.get("hasNextPage"):
            return docs
        page += 1


def patch_post(post_id: int | str, fields: dict) -> dict:
    return request("PATCH", f"/api/posts/{post_id}", fields)


# --- markdown-aware replacement ----------------------------------------------

# Fenced code blocks first (greedy per block), then inline code spans.
_CODE_RE = re.compile(r"```[\s\S]*?```|``[^`\n]*``|`[^`\n]*`")


def split_segments(content: str) -> list[tuple[bool, str]]:
    """Split into (is_code, text) segments covering the whole string."""
    segments, last = [], 0
    for m in _CODE_RE.finditer(content):
        if m.start() > last:
            segments.append((False, content[last : m.start()]))
        segments.append((True, m.group(0)))
        last = m.end()
    if last < len(content):
        segments.append((False, content[last:]))
    return segments


def replace_outside_code(
    content: str, replacements: list[tuple[str, str]]
) -> tuple[str, list[dict]]:
    """Apply exact-string replacements outside code; regex pairs use
    ("re:<pattern>", replacement). Returns (new_content, change_log)."""
    changes = []
    out = []
    for is_code, seg in split_segments(content):
        if is_code:
            for old, _new in replacements:
                needle = old[3:] if old.startswith("re:") else old
                if (re.search(needle, seg) if old.startswith("re:") else needle in seg):
                    changes.append({"skipped_in_code": True, "old": old})
            out.append(seg)
            continue
        for old, new in replacements:
            if old.startswith("re:"):
                pat = re.compile(old[3:])
                n = len(pat.findall(seg))
                if n:
                    seg = pat.sub(new, seg)
                    changes.append({"old": old, "new": new, "count": n})
            elif old in seg:
                n = seg.count(old)
                seg = seg.replace(old, new)
                changes.append({"old": old, "new": new, "count": n})
        out.append(seg)
    return "".join(out), changes


def unified_diff(old: str, new: str, slug: str) -> str:
    return "\n".join(
        difflib.unified_diff(
            old.splitlines(), new.splitlines(),
            fromfile=f"{slug} (before)", tofile=f"{slug} (after)", lineterm="", n=1,
        )
    )
