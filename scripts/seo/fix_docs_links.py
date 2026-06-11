"""Phase 2b: rewrite redirecting railway-family links to their final URLs.

Collects every docs.railway.com / docs.railway.app / railway.com /
railway.app / blog.railway.* / station.railway.com link from prose
(code fences and inline code are never touched), resolves each unique URL
through its full redirect chain, and rewrites links whose final
destination differs and answers 200. Fragments are kept only when the
final page actually contains the anchor; otherwise they are dropped.

Media hosts (cms.railway.com, og.railway.com) are functional URLs and are
left alone. URLs whose redirect chain ends in a non-200 are NOT rewritten;
they are listed in the report for a manual decision.

Usage: python3 scripts/seo/fix_docs_links.py [--apply]
Writes reports/2b-docs-links[.dryrun].md
"""
import concurrent.futures
import json
import os
import re
import sys
import urllib.parse
import urllib.request

sys.path.insert(0, "scripts/seo")
from cms import all_posts, patch_post, replace_outside_code, split_segments

HOSTS = r"(?:docs\.railway\.(?:com|app)|railway\.(?:com|app)|blog\.railway\.(?:com|app)|station\.railway\.com)"
URL_RE = re.compile(rf"https?://{HOSTS}(?:/[^\s)\]\"'<>]*)?")
TRAIL_PUNCT = ".,;:!?"

UA = {"User-Agent": "Mozilla/5.0 (compatible; railway-blog-link-fix)"}


def resolve(url: str) -> dict:
    """Follow redirects manually (fragment stripped); return final info."""
    base, _, frag = url.partition("#")
    cur, hops = base, []
    body = b""
    status = 0
    for _ in range(6):
        try:
            req = urllib.request.Request(cur, headers=UA)

            class NoRedirect(urllib.request.HTTPRedirectHandler):
                def redirect_request(self, *a, **k):
                    return None

            opener = urllib.request.build_opener(NoRedirect)
            with opener.open(req, timeout=15) as r:
                status, body = r.status, r.read(400_000)
                break
        except urllib.error.HTTPError as e:
            if 300 <= e.code < 400 and e.headers.get("Location"):
                nxt = urllib.parse.urljoin(cur, e.headers["Location"])
                hops.append((e.code, nxt))
                cur = nxt.partition("#")[0]
                continue
            status = e.code
            break
        except Exception:
            status = 0
            break
    return {"url": url, "base": base, "frag": frag, "final": cur, "status": status,
            "hops": hops, "body": body.decode("utf-8", "replace") if status == 200 else ""}


def main() -> None:
    apply = "--apply" in sys.argv
    posts = [p for p in all_posts() if p.get("_status") == "published" and not p.get("archivedAt")]

    # 1. collect candidate URLs per post from prose segments only
    per_post: dict[str, list[str]] = {}
    uniq: set[str] = set()
    for p in posts:
        found = []
        for is_code, seg in split_segments(p.get("content") or ""):
            if is_code:
                continue
            for m in URL_RE.finditer(seg):
                u = m.group(0).rstrip(TRAIL_PUNCT).rstrip(")")
                # markdown artifacts: a ")" can legitimately end a bare URL,
                # but link targets are extracted cleanly by the regex stop-set;
                # rstrip is safe because no railway URL ends with ")".
                found.append(u)
        if found:
            per_post[p["slug"]] = found
            uniq.update(found)

    print(f"posts with railway-family prose links: {len(per_post)}; unique URLs: {len(uniq)}")

    # 2. resolve unique URLs (fragment-stripped base dedup to spare requests)
    bases = sorted({u.partition("#")[0] for u in uniq})
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:
        base_info = {r["base"]: r for r in ex.map(resolve, bases)}

    # 3. build rewrite map per full URL
    rewrites: dict[str, str] = {}
    broken: dict[str, int] = {}
    dropped_frags: list[tuple[str, str]] = []
    for u in sorted(uniq):
        base, _, frag = u.partition("#")
        info = base_info[base]
        if info["status"] != 200:
            broken[u] = info["status"]
            continue
        final = info["final"]
        if final == base:
            continue  # already canonical
        new = final
        if frag:
            if re.search(rf'(?:id|name)=["\']{re.escape(frag)}["\']', info["body"]):
                new = f"{final}#{frag}"
            else:
                dropped_frags.append((u, final))
        if new != u:
            rewrites[u] = new

    print(f"rewrites: {len(rewrites)}  unresolved(non-200 final): {len(broken)}  dropped fragments: {len(dropped_frags)}")

    # 4. apply per post
    report = ["# 2b — Redirecting railway-family links → final URLs",
              f"\nMode: {'APPLY' if apply else 'DRY RUN'}",
              f"\nUnique URLs found: {len(uniq)}; rewritten: {len(rewrites)}\n"]
    if broken:
        report.append("## NOT rewritten (redirect chain ends non-200 — manual decision)\n")
        for u, st in sorted(broken.items()):
            report.append(f"- `{u}` → final status {st}")
    if dropped_frags:
        report.append("\n## Fragments dropped (anchor not present on final page)\n")
        for u, f in dropped_frags:
            report.append(f"- `{u}` → `{f}`")

    changed_posts = 0
    total = 0
    rows = []
    for p in posts:
        slug = p["slug"]
        if slug not in per_post:
            continue
        pairs = [(u, rewrites[u]) for u in sorted(set(per_post[slug]), key=len, reverse=True) if u in rewrites]
        if not pairs:
            continue
        old_content = p.get("content") or ""
        new_content, changes = replace_outside_code(old_content, pairs)
        applied = [c for c in changes if not c.get("skipped_in_code")]
        if new_content == old_content:
            continue
        changed_posts += 1
        n = sum(c.get("count", 0) for c in applied)
        total += n
        rows.append((slug, n))
        report.append(f"\n## {slug} (post id {p['id']}) — {n} link(s)")
        for c in applied:
            report.append(f"- `{c['old']}` → `{c['new']}` ×{c['count']}")
        if apply:
            patch_post(p["id"], {"content": new_content})
            report.append("**APPLIED** ✓")

    print(f"\nposts changed: {changed_posts}, link occurrences rewritten: {total}")
    for slug, n in rows:
        print(f"  {slug:60} {n}")

    os.makedirs("reports", exist_ok=True)
    out = f"reports/2b-docs-links{'' if apply else '.dryrun'}.md"
    with open(out, "w") as f:
        f.write("\n".join(report) + "\n")
    print(f"report: {out}")
    json.dump(rewrites, open("/tmp/2b_rewrites.json", "w"), indent=1)


if __name__ == "__main__":
    main()
