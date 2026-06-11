"""Phase 2d: write approved seoDescription drafts to the CMS.

Reads reports/2d-descriptions.json — [{"slug", "proposed", ...}] — the same
file the review doc is generated from, so user edits to that JSON are what
get applied. Writes ONLY the seoDescription field: `description` is visible
card copy on the site and is deliberately left alone (the meta tag reads
seoDescription ?? description).

Usage: python3 scripts/seo/apply_descriptions.py [--apply] [--only slug1,slug2]
"""
import json
import os
import sys

sys.path.insert(0, "scripts/seo")
from cms import all_posts, patch_post

SRC = "reports/2d-descriptions.json"


def main() -> None:
    apply = "--apply" in sys.argv
    only = None
    if "--only" in sys.argv:
        only = set(sys.argv[sys.argv.index("--only") + 1].split(","))

    drafts = {d["slug"]: d["proposed"] for d in json.load(open(SRC))}
    if only:
        drafts = {s: p for s, p in drafts.items() if s in only}

    bad = {s: p for s, p in drafts.items() if not (110 <= len(p) <= 160)}
    if bad:
        for s, p in bad.items():
            print(f"LENGTH VIOLATION ({len(p)}): {s}: {p}")
        raise SystemExit(f"{len(bad)} drafts out of range — fix {SRC} first")

    posts = {p["slug"]: p for p in all_posts()}
    report = [f"# 2d — seoDescription updates\n\nMode: {'APPLY' if apply else 'DRY RUN'}\n"]
    n = 0
    for slug, proposed in drafts.items():
        post = posts.get(slug)
        if not post:
            print(f"MISSING POST: {slug}")
            continue
        old = post.get("seoDescription") or ""
        report.append(f"\n## {slug} (post id {post['id']})")
        report.append(f"- old seoDescription: {old or '(empty — meta fell back to description)'}")
        report.append(f"- new seoDescription ({len(proposed)} chars): {proposed}")
        if apply:
            patch_post(post["id"], {"seoDescription": proposed})
            report.append("**APPLIED** ✓")
        n += 1

    os.makedirs("reports", exist_ok=True)
    out = f"reports/2d-descriptions-applied{'' if apply else '.dryrun'}.md"
    with open(out, "w") as f:
        f.write("\n".join(report) + "\n")
    print(f"{'applied' if apply else 'would apply'}: {n} posts  → {out}")


if __name__ == "__main__":
    main()
