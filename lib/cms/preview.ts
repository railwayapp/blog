export const previewHeaders = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
}

export const previewToken = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 && value.length <= 1024
    ? value
    : null

export const postPreviewPath = (slug: unknown): string | null => {
  if (
    typeof slug !== "string" ||
    !slug.trim() ||
    slug !== slug.trim() ||
    slug.length > 240 ||
    /[/?#\\]/.test(slug) ||
    [".", ".."].includes(slug)
  )
    return null
  const path = `/p/${encodeURIComponent(slug)}`
  return path.length <= 512 ? path : null
}
