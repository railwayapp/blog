"""Phase 2b (part 2): re-point links whose redirect chains end in 404/500.

fix_docs_links.py only rewrites redirects that land on a 200; these are the
leftovers it flagged. Every target below was probed 200 on 2026-06-11:

- Old railway.app/template/<code> short-codes still resolve through the
  legacy railway.com/new/template/<code> prefix, so original templates are
  preserved exactly. Where the template has a canonical marketplace page
  (railway.com/deploy/<name>), that page is preferred.
- Truly dead templates (Offen, Prisma Pulse — products discontinued) point
  at marketplace search instead.
- Dead old-IA docs paths point at today's equivalent page.

Usage: python3 scripts/seo/fix_broken_links.py [--apply]
"""
import os
import sys

sys.path.insert(0, "scripts/seo")
from cms import all_posts, patch_post, replace_outside_code, unified_diff

REWRITES: dict[str, str] = {
    # docs (old IA, no redirect)
    "https://docs.railway.app/cli/api-reference#link": "https://docs.railway.com/cli",
    "https://docs.railway.app/cli/quick-start": "https://docs.railway.com/cli",
    "https://docs.railway.app/deployment/custom-domains": "https://docs.railway.com/networking/public-networking",
    "https://docs.railway.app/deployment/github-triggers": "https://docs.railway.com/deployments",
    "https://docs.railway.app/deployment/project-tokens": "https://docs.railway.com/integrations/api",
    "https://docs.railway.app/guides/database-migration-guide#migration-timeline": "https://docs.railway.com/databases",
    "https://docs.railway.app/plugins/postgresql": "https://docs.railway.com/databases/postgresql",
    # old product pages
    "https://railway.app/button": "https://docs.railway.com/templates",
    "https://railway.app/compose": "https://railway.com/new/template",
    "https://railway.com/metal": "https://docs.railway.com/platform/railway-metal",
    # named templates -> canonical marketplace pages
    "https://railway.app/template/meilisearch": "https://railway.com/deploy/meilisearch",
    "https://railway.app/template/postgres": "https://railway.com/deploy/postgres",
    "https://railway.app/template/redis": "https://railway.com/deploy/redis",
    "https://railway.app/template/mongo": "https://railway.com/deploy/mongo",
    "https://railway.app/template/mysql": "https://railway.com/deploy/mysql",
    "https://railway.app/template/clickhouse": "https://railway.com/deploy/clickhouse",
    "https://railway.app/template/authorizer": "https://railway.com/deploy/authorizer",
    "https://railway.app/template/umami-analytics": "https://railway.com/deploy/umami",
    "https://railway.app/template/3jJFCA": "https://railway.com/deploy/pgvector",  # PGVector
    "https://railway.app/template/tifygm": "https://railway.com/deploy/chroma",  # Chroma
    "https://railway.app/template/L22H6p": "https://railway.com/deploy/metabase",  # Metabase
    "https://railway.app/template/2fy758": "https://railway.com/deploy/directus",  # Directus
    "https://railway.com/template/2fy758": "https://railway.com/deploy/directus",
    # codes with no named page -> legacy new/template prefix (same template)
    "https://railway.app/template/odzp-I": "https://railway.com/new/template/odzp-I",
    "https://railway.app/template/EVFIqE": "https://railway.com/new/template/EVFIqE",
    "https://railway.app/template/SMKOEA": "https://railway.com/new/template/SMKOEA",
    "https://railway.app/template/fiqpE3": "https://railway.com/new/template/fiqpE3",
    "https://railway.app/template/SJzxFe?referralCode=androidquartz": "https://railway.com/new/template/SJzxFe?referralCode=androidquartz",
    "https://railway.app/template/4fD3YO?referralCode=androidquartz": "https://railway.com/new/template/4fD3YO?referralCode=androidquartz",
    "https://railway.app/template/nvnuEH?referralCode=BAh47U": "https://railway.com/new/template/nvnuEH?referralCode=BAh47U",
    # templates of discontinued products -> marketplace search
    "https://railway.app/new/template/Xd0y9_": "https://railway.com/deploy?q=offen",
    "https://railway.app/template/pulse-starter": "https://railway.com/deploy?q=prisma",
    "https://railway.app/template/pulse-pg": "https://railway.com/deploy?q=prisma",
}


def main() -> None:
    apply = "--apply" in sys.argv
    pairs = sorted(REWRITES.items(), key=lambda kv: len(kv[0]), reverse=True)
    report = [f"# 2b part 2 — dead-end links re-pointed\n\nMode: {'APPLY' if apply else 'DRY RUN'}\n"]

    changed = 0
    for p in all_posts():
        if p.get("_status") != "published" or p.get("archivedAt"):
            continue
        old = p.get("content") or ""
        if not any(k in old for k, _ in pairs):
            continue
        new, changes = replace_outside_code(old, pairs)
        applied = [c for c in changes if not c.get("skipped_in_code")]
        skipped = [c for c in changes if c.get("skipped_in_code")]
        if new == old and not skipped:
            continue
        changed += 1
        report.append(f"\n## {p['slug']} (post id {p['id']})")
        for c in applied:
            report.append(f"- `{c['old']}` → `{c['new']}` ×{c['count']}")
        for c in skipped:
            report.append(f"- SKIPPED (inside code): `{c['old']}`")
        print(f"{p['slug']}: {sum(c.get('count',0) for c in applied)} link(s)"
              + (f", {len(skipped)} skipped-in-code" if skipped else ""))
        if apply and new != old:
            patch_post(p["id"], {"content": new})
            report.append("**APPLIED** ✓")

    print(f"\nposts changed: {changed}")
    os.makedirs("reports", exist_ok=True)
    out = f"reports/2b-broken-links{'' if apply else '.dryrun'}.md"
    with open(out, "w") as f:
        f.write("\n".join(report) + "\n")
    print(f"report: {out}")


if __name__ == "__main__":
    main()
