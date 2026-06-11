"""Phase 2c: alt text for the 7 images that have none (5 posts).

Alts were written after viewing each image. NOTE: the renderer derives the
visible figcaption from `title ?? alt`, so these images gain a caption too —
that is the site's established alt-as-caption pattern (415 figcaptions render
this way), but it IS a visible change; each one is listed in the report.

Usage: python3 scripts/seo/fix_image_alts.py [--apply]
"""
import os
import sys

sys.path.insert(0, "scripts/seo")
from cms import get_post, patch_post, replace_outside_code

MEDIA = "https://cms.railway.com/media/"

ALTS: dict[str, list[tuple[str, str]]] = {
    "ghost": [(
        "b1ce5423c0d866c1c196cc5d9ab4ec0f2f47ee61580df7487df9060386ad2fb4.png",
        "Homepage of a Ghost blog deployed on Railway",
    )],
    "hello-world": [(
        "5505c4ab70f4b80ad6e37b35e8ad26b807cfcf3670c8fb75f351d7af50f9a331.svg",
        "The Deploy on Railway button",
    )],
    "how-we-work": [
        (
            "000e8c9a1fcad27d013a07df2a7c7c66830020f869aa510d4bb76b07e87514ef.png",
            "A daily wrap post in Discord listing yesterday's work and tomorrow's plan",
        ),
        (
            "ed32d59ffca82be469229e93b7a7b3db022a2f89b73980683e7054258d25164b.png",
            "A daily wrap in Discord with a teammate breaking out into a thread",
        ),
        (
            "2b38f46fbf458c3d81d32f742f4131729bffdd095101e073ab27096882ef4ba8.png",
            "The Railway work cycle flowing between Notion, Linear, and Discord",
        ),
    ],
    "how-we-work-volume-iii": [(
        "916f635acefa40ead4cf8c5649e6bc1de8c744d329adf27fe17d233fcc864d53.png",
        'Discord message from a teammate: "don\'t tell me what I can\'t do"',
    )],
    "launch-week-01-changesets": [(
        "2d9bbe533e99190c98f478c686281d31fe66e74966b1ba68c6d874a6a8915dad.png",
        "Git graph with commits A and B on main and a staging branch with commits C and D",
    )],
}


def main() -> None:
    apply = "--apply" in sys.argv
    report = [f"# 2c — Image alt text\n\nMode: {'APPLY' if apply else 'DRY RUN'}\n",
              "These alts also render as visible figcaptions (site pattern: alt is the caption).\n"]
    for slug, images in ALTS.items():
        post = get_post(slug)
        old = post["content"] or ""
        pairs = [(f"![]({MEDIA}{h})", f"![{alt}]({MEDIA}{h})") for h, alt in images]
        new, changes = replace_outside_code(old, pairs)
        applied = sum(c.get("count", 0) for c in changes if not c.get("skipped_in_code"))
        report.append(f"\n## {slug} (post id {post['id']}) — {applied}/{len(images)} image(s)")
        for h, alt in images:
            report.append(f"- `…{h[:16]}…` → alt/caption: **{alt}**")
        if applied != len(images):
            report.append(f"- ⚠ expected {len(images)}, matched {applied}")
        print(f"{slug}: {applied}/{len(images)}")
        if apply and new != old:
            patch_post(post["id"], {"content": new})
            report.append("**APPLIED** ✓")
    os.makedirs("reports", exist_ok=True)
    out = f"reports/2c-image-alts{'' if apply else '.dryrun'}.md"
    with open(out, "w") as f:
        f.write("\n".join(report) + "\n")
    print(f"report: {out}")


if __name__ == "__main__":
    main()
