const OG_BASE_URL = "https://og.railway.com/api/image"

/**
 * Build the OG image URL for a blog post.
 *
 * By default the card is generated dynamically by the Graphics Studio `blog`
 * layout (served at og.railway.com) from fields the post already has in
 * the CMS, so no per-post image setup is required. A manually set social image
 * URL still wins as an escape hatch.
 *
 * OG images are scraped server-side, so the theme is fixed to the brand `plum`
 * rather than the reader's light/dark preference.
 */
export const useOgImage = ({
  title,
  authorName,
  role,
  avatarUrl,
  eyebrow,
  subtitle,
  image,
}: {
  title: string
  authorName: string
  role?: string
  avatarUrl?: string
  eyebrow?: string
  subtitle?: string
  image?: string
}): string => {
  // Manual escape hatch: a CMS social image URL always wins.
  if (image) return image

  const params = new URLSearchParams({
    fileType: "png",
    layoutName: "blog",
    Theme: "plum",
    Title: title,
    Author: authorName,
    // Always send Role (even empty) so the layout's "Founding Engineer"
    // default never leaks onto a card with no resolved role.
    Role: role ?? "",
    ShowAuthor: authorName ? "true" : "false",
  })

  // A real author photo (stable URL) overrides the default colored avatar circle.
  if (avatarUrl) {
    params.set("AuthorImage", avatarUrl)
  }

  if (eyebrow) {
    params.set("Eyebrow", eyebrow)
  } else {
    params.set("ShowEyebrow", "false")
  }

  if (subtitle) {
    params.set("Subtitle", subtitle)
  } else {
    params.set("ShowSubtitle", "false")
  }

  return `${OG_BASE_URL}?${params.toString()}`
}
