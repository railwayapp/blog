"""Phase 2a: fix Error-level links in post content (Ahrefs health-score issues).

- Dead URLs (404/410, live-verified 2026-06-11) -> live equivalents,
  each probed 200 before being chosen.
- Notion-export relative .md artifact in free-plan -> https://railway.com/new
  ("Sign up [here] to get started").
- http:// internal links -> https:// finals (railway.app host -> railway.com).
- Prose links to mcp.railway.com (302) -> https://railway.com/mcp; code/config
  occurrences are never touched (the hostname is a functional MCP endpoint).
- docs.railway.* links are out of scope here: fix_docs_links.py (2b) rewrites
  every docs link, including http:// ones, to its final URL.

Usage: python3 scripts/seo/fix_error_links.py [--apply]
Default is a dry run that writes reports/2a-error-links.md for review.
"""
import re
import sys

sys.path.insert(0, "scripts/seo")
from cms import get_post, patch_post, replace_outside_code, unified_diff

# Exact old -> new, per post. "re:" prefix marks a regex pattern.
SPEC: dict[str, list[tuple[str, str]]] = {
    "railway-for-frontend": [
        ("https://railway.com/template/yDom4a", "https://railway.com/deploy/nextjs"),
        ("https://railway.com/template/lQQgLR", "https://railway.com/deploy?q=nuxt"),
        ("https://railway.com/template/Ic0JBh", "https://railway.com/deploy/astro"),
        ("https://railway.com/template/Qh0OAU", "https://railway.com/deploy/vue-3"),
        ("https://railway.com/template/NeiLty", "https://railway.com/deploy/vite-react"),
        ("https://railway.com/template/svelte-kit", "https://railway.com/deploy/svelte-kit"),
        ("https://railway.com/template/A5t142", "https://railway.com/deploy?q=angular"),
    ],
    "1M-paid-to-developers-who-built-railway-templates": [
        ("https://railway.com/deploy/b5k2mn", "https://railway.com/deploy/librechat"),
        ("https://railway.com/deploy/indNPy", "https://railway.com/deploy?q=handbrake"),
        ("https://railway.com/deploy/posthog", "https://railway.com/deploy?q=posthog"),
        ("https://railway.com/templates", "https://railway.com/deploy"),
        ("http://station.railway.com/roadmap", "https://station.railway.com/roadmap"),
    ],
    "annoucing-railway-technology-partners": [
        ("https://railway.com/deploy/storage/prisma", "https://railway.com/deploy/prisma-postgres"),
        ("https://railway.com/deploy/storage/drizzle", "https://railway.com/deploy/drizzle"),
        ("https://railway.com/deploy/cms/directus", "https://railway.com/deploy/directus"),
    ],
    "2fa-audit-logs-compliance": [
        ("https://railway.com/demo", "https://railway.com/enterprise"),
    ],
    "free-plan": [
        (
            "(Your%20Free%20Plan%20is%20Killing%20Your%20Company%201d30e4c5456380988e4ad4f460b7263e.md)",
            "(https://railway.com/new)",
        ),
    ],
    "hackathon-2025-winners": [
        ("http://railway.com/deploy/switchyard", "https://railway.com/deploy/switchyard"),
        ("http://railway.com/deploy/rundown-1", "https://railway.com/deploy/rundown-1"),
        ("http://railway.com/deploy/pushflow", "https://railway.com/deploy/pushflow"),
        ("http://railway.com/deploy/teamx-appwrite", "https://railway.com/deploy/teamx-appwrite"),
    ],
    "railway-hackathon-2025": [
        ("http://railway.com/deploy", "https://railway.com/deploy"),
        ("http://station.railway.com", "https://station.railway.com"),
    ],
    "data-center-build-part-two": [
        ("http://railway.com/careers", "https://railway.com/careers"),
    ],
    "introducing-railpack": [
        ("re:http://railway\\.com(?![\\w./-])", "https://railway.com"),
    ],
    "twin-macro-tailwind-migration": [
        ("re:http://railway\\.app(?![\\w./-])", "https://railway.com"),
    ],
    "best-cloud-application-deployment-platforms-2026": [
        ("re:http://railway\\.com(?![\\w./-])", "https://railway.com"),
    ],
    "moving-railways-frontend-off-nextjs": [
        ("re:http://railway\\.com(?![\\w./-])", "https://railway.com"),
    ],
    "one-click-domains": [
        ("http://railway.com/domains", "https://railway.com/domains"),
    ],
    "announcing-railway-partnerships": [
        ("http://railway.com/partners", "https://railway.com/partners"),
    ],
    # Prose links to the MCP endpoint host: target becomes the landing page the
    # 302 points at. Only rewrites the (...) target of a markdown link.
    "agent-rails-remote-mcp-cli": [
        ("re:\\]\\(\\s*https?://mcp\\.railway\\.com/?\\s*\\)", "](https://railway.com/mcp)"),
    ],
    "railway-for-agents": [
        ("re:\\]\\(\\s*https?://mcp\\.railway\\.com/?\\s*\\)", "](https://railway.com/mcp)"),
    ],
}


def main() -> None:
    apply = "--apply" in sys.argv
    report = ["# 2a — Error-level link fixes", ""]
    report.append(f"Mode: {'APPLY' if apply else 'DRY RUN'}", )
    summary = []

    for slug, replacements in SPEC.items():
        post = get_post(slug)
        old_content = post["content"] or ""
        new_content, changes = replace_outside_code(old_content, replacements)

        applied = [c for c in changes if not c.get("skipped_in_code")]
        skipped = [c for c in changes if c.get("skipped_in_code")]
        missing = [
            old for old, _ in replacements
            if not any(c["old"] == old for c in changes)
        ]

        report.append(f"\n## {slug}  (post id {post['id']})")
        for c in applied:
            report.append(f"- `{c['old']}` → `{c['new']}`  ×{c['count']}")
        for c in skipped:
            report.append(f"- SKIPPED (inside code): `{c['old']}`")
        for m in missing:
            report.append(f"- NOT FOUND in content: `{m}`")
        if new_content != old_content:
            report.append("\n```diff\n" + unified_diff(old_content, new_content, slug) + "\n```")

        summary.append((slug, post["id"], len(applied), len(skipped), len(missing)))

        if apply and new_content != old_content:
            patch_post(post["id"], {"content": new_content})
            report.append("**APPLIED** ✓")

    print(f"\n{'='*72}\nSUMMARY ({'APPLY' if apply else 'DRY RUN'})")
    print(f"{'post':52} {'chg':>4} {'skip':>4} {'miss':>4}")
    for slug, pid, a, s, m in summary:
        print(f"{slug:52} {a:>4} {s:>4} {m:>4}")

    import os
    os.makedirs("reports", exist_ok=True)
    out = f"reports/2a-error-links{'' if apply else '.dryrun'}.md"
    with open(out, "w") as f:
        f.write("\n".join(report) + "\n")
    print(f"\nreport: {out}")


if __name__ == "__main__":
    main()
