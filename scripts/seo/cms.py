"""Shared helpers for the SEO content-fix scripts.

Read/write client for the Railway CMS plus markdown-aware string
replacement: replacements never touch fenced code blocks or inline code,
because URLs there (config samples, CLI output) are functional content.
"""
from __future__ import annotations

import difflib
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

CMS_URL = os.environ.get("CMS_API_URL", "https://cms.railway.com")
POSTS_QUERY = Path(__file__).with_name("posts.graphql").read_text()
UPDATE_POST_MUTATION = Path(__file__).with_name("update-post.graphql").read_text()


class CMSRequestError(RuntimeError):
    def __init__(self, operation: str, status: int, outcome: str):
        self.status = status
        self.outcome = outcome
        message = f"CMS {operation} failed ({status})."
        if outcome == "unknown":
            message += " The update may have committed. Check the post before trying again."
        super().__init__(message)


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


_opener = urllib.request.build_opener(_NoRedirect())


def _api_key() -> str:
    key = os.environ.get("CMS_API_KEY")
    if not key and os.path.exists(".env.local"):
        with open(".env.local") as env:
            for line in env:
                if line.startswith("CMS_API_KEY="):
                    key = line.split("=", 1)[1].strip().strip('"').strip("'")
    if not key:
        raise SystemExit("CMS_API_KEY not found (env or .env.local)")
    return key


def _failure(operation: str, status: int, *, mutation: bool, rejected=False):
    outcome = "read-failed"
    if mutation:
        outcome = "rejected" if rejected else "unknown"
    return CMSRequestError(operation, status, outcome)


def _query(operation: str, document: str, variables: dict, *, mutation=False) -> dict:
    """Dispatch once. An uncertain update must never be retried automatically."""
    req = urllib.request.Request(
        urllib.parse.urljoin(CMS_URL.rstrip("/") + "/", "/api/graphql"),
        method="POST",
        headers={
            "Authorization": f"Bearer {_api_key()}",
            "Content-Type": "application/json",
            "Accept": "application/graphql-response+json",
            "X-CMS-Client": "blog-seo",
        },
        data=json.dumps(
            {"operationName": operation, "query": document, "variables": variables}
        ).encode(),
    )
    try:
        with _opener.open(req, timeout=60) as response:
            body = json.load(response)
    except urllib.error.HTTPError as error:
        error.close()
        raise _failure(
            operation,
            error.code,
            mutation=mutation,
            rejected=400 <= error.code < 500 and error.code != 408,
        ) from None
    except (urllib.error.URLError, OSError):
        raise _failure(operation, 0, mutation=mutation) from None
    except (ValueError, UnicodeError):
        raise _failure(operation, 502, mutation=mutation) from None

    if not isinstance(body, dict):
        raise _failure(operation, 502, mutation=mutation)
    errors = body.get("errors", [])
    if not isinstance(errors, list):
        raise _failure(operation, 502, mutation=mutation)
    data = body.get("data")
    result = data.get("result") if isinstance(data, dict) else None
    if errors:
        problem = errors[0] if isinstance(errors[0], dict) else {}
        extensions = problem.get("extensions")
        extensions = extensions if isinstance(extensions, dict) else {}
        status = extensions.get("statusCode")
        if type(status) is not int or not 400 <= status < 600:
            status = 502
        raise _failure(
            operation,
            status,
            mutation=mutation,
            rejected=result is None and extensions.get("outcome") == "rejected",
        )
    if not isinstance(result, dict):
        raise _failure(operation, 502, mutation=mutation)
    return result


def _post(value: object, operation: str, *, mutation=False) -> dict:
    if not isinstance(value, dict) or type(value.get("id")) is not int:
        raise _failure(operation, 502, mutation=mutation)
    present = value.get("_cmsFields")
    if not isinstance(present, list) or any(
        not isinstance(key, str) for key in present
    ):
        raise _failure(operation, 502, mutation=mutation)
    if "id" not in present:
        raise _failure(operation, 502, mutation=mutation)
    # The receipt preserves omitted/denied fields instead of inventing null values.
    return {
        key: item
        for key, item in value.items()
        if key != "_cmsFields" and key in present
    }


def _posts(page: int, limit: int, where: dict | None = None) -> dict:
    result = _query(
        "SEOPosts", POSTS_QUERY, {"where": where, "page": page, "limit": limit}
    )
    if (
        not isinstance(result.get("docs"), list)
        or type(result.get("hasNextPage")) is not bool
    ):
        raise _failure("SEOPosts", 502, mutation=False)
    return {**result, "docs": [_post(doc, "SEOPosts") for doc in result["docs"]]}


def get_post(slug: str) -> dict:
    docs = _posts(1, 1, {"slug": {"equals": slug}})["docs"]
    if not docs:
        raise SystemExit(f"post not found: {slug}")
    return docs[0]


def all_posts() -> list[dict]:
    docs, page = [], 1
    while True:
        d = _posts(page, 100)
        docs += d["docs"]
        if not d.get("hasNextPage"):
            return docs
        next_page = d.get("nextPage")
        if next_page is None:
            next_page = page + 1
        if type(next_page) is not int or next_page <= page:
            raise _failure("SEOPosts", 502, mutation=False)
        page = next_page


def patch_post(post_id: int | str, fields: dict) -> dict:
    result = _query(
        "SEOUpdatePost",
        UPDATE_POST_MUTATION,
        {"id": str(post_id), "data": fields},
        mutation=True,
    )
    return {"doc": _post(result, "SEOUpdatePost", mutation=True)}


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
