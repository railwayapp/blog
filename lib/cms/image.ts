// Helpers for the Railway CMS imgproxy media gateway. Every CMS media URL
// (https://cms.railway.com/media/<filename>) accepts transform query params and
// serves resized, reformatted, CDN-cached images. We build already-canonical
// URLs (snapped widths, canonical param order) so requests hit the CDN cache
// directly (200) instead of triggering a 308 redirect to the canonical form.

const DEFAULT_CMS_API_URL = "https://cms.railway.com"

// Width ladder the gateway snaps to (rounding up). Mirrored here so the srcset
// widths we emit are already canonical. Keep in sync with the CMS.
export const CMS_IMAGE_WIDTHS = [
  320, 480, 640, 768, 960, 1200, 1440, 1600, 1920, 2400, 3200,
] as const

// High quality — the resize + WebP conversion already yields ~90–98% byte
// reduction vs the original, so we keep quality high to preserve text/UI
// clarity. Must be one of the gateway's allowed values {60,70,75,80,85,90,95}.
export const CMS_IMAGE_QUALITY = 90

type ImageFormat = "webp" | "avif" | "jpg" | "png"

interface CMSImageOptions {
  width?: number
  height?: number
  fit?: "cover" | "contain"
  format?: ImageFormat
  quality?: number
}

const getCMSHost = (): string | null => {
  try {
    return new URL(process.env.CMS_API_URL || DEFAULT_CMS_API_URL).host
  } catch {
    return null
  }
}

// imgproxy resizes/reformats raster images, but some formats can't go through
// it: SVGs produce a broken response, and animated GIFs come back as a single
// static frame. These must be passed through untouched even when served from
// the CMS gateway.
const PASSTHROUGH_EXTENSIONS = [".svg", ".gif"]

const isPassthroughURL = (url: string): boolean => {
  try {
    const pathname = new URL(url).pathname.toLowerCase()
    return PASSTHROUGH_EXTENSIONS.some((ext) => pathname.endsWith(ext))
  } catch {
    return false
  }
}

// Only transform first-party CMS media. Everything else (GitHub avatars,
// /public assets, SVGs, GIFs, og.railway) is passed through untouched.
export const isCMSMediaURL = (url: string): boolean => {
  const host = getCMSHost()
  if (!host) return false

  try {
    const parsed = new URL(url)
    return (
      parsed.host === host &&
      parsed.pathname.startsWith("/media/") &&
      !isPassthroughURL(url)
    )
  } catch {
    return false
  }
}

const snapWidth = (width: number): number =>
  CMS_IMAGE_WIDTHS.find((candidate) => candidate >= width) ??
  CMS_IMAGE_WIDTHS[CMS_IMAGE_WIDTHS.length - 1]

export const buildCMSImageURL = (
  url: string,
  opts: CMSImageOptions = {}
): string => {
  if (!isCMSMediaURL(url)) return url

  const parsed = new URL(url)
  // Build params in canonical order: w, h, fit, format, q. Drop fit=contain
  // (the default). Preserve any pre-existing query params on the base URL.
  const params = new URLSearchParams(parsed.search)

  if (opts.width !== undefined) params.set("w", String(snapWidth(opts.width)))
  if (opts.height !== undefined) params.set("h", String(opts.height))
  if (opts.fit === "cover") params.set("fit", opts.fit)
  if (opts.format !== undefined) params.set("format", opts.format)
  params.set("q", String(opts.quality ?? CMS_IMAGE_QUALITY))

  parsed.search = params.toString()
  return parsed.toString()
}

export const buildCMSImageSrcSet = (
  url: string,
  opts: { format?: ImageFormat; quality?: number; maxWidth?: number } = {}
): string | undefined => {
  if (!isCMSMediaURL(url)) return undefined

  const maxWidth = opts.maxWidth ?? CMS_IMAGE_WIDTHS[CMS_IMAGE_WIDTHS.length - 1]

  return CMS_IMAGE_WIDTHS.filter((width) => width <= maxWidth)
    .map(
      (width) =>
        `${buildCMSImageURL(url, {
          format: opts.format,
          quality: opts.quality,
          width,
        })} ${width}w`
    )
    .join(", ")
}
