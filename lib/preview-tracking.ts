import type { BeforeSendFn } from "posthog-js"

export const hasPreviewURL = (value: unknown): boolean => {
  if (typeof value !== "string") return false
  try {
    const url = new URL(value, "https://blog.railway.com")
    return (
      url.searchParams.has("cmsPreview") || url.pathname.startsWith("/preview/")
    )
  } catch {
    return false
  }
}

// Block capture before a client transition can render draft DOM.
let enteringPreview = false
export const setPreviewTransition = (value: boolean) => {
  enteringPreview = value
}
export const isContentPreview = () =>
  enteringPreview ||
  (typeof window !== "undefined" && hasPreviewURL(window.location.href))

const redactPreviewURLs = (value: unknown): unknown => {
  if (typeof value === "string") return hasPreviewURL(value) ? undefined : value
  if (Array.isArray(value))
    return value.map((item) => redactPreviewURLs(item) ?? null)
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key, redactPreviewURLs(item)])
        .filter(([, item]) => item !== undefined)
    )
  }
  return value
}

export const filterPreviewEvent: BeforeSendFn = (event) => {
  if (
    !event ||
    isContentPreview() ||
    hasPreviewURL(event.properties.$current_url)
  )
    return null
  // These SDK buffers are opaque; never recursively copy recording/heatmap payloads.
  const payloadKey =
    event.event === "$snapshot"
      ? "$snapshot_data"
      : event.event === "$$heatmap"
      ? "$heatmap_data"
      : undefined
  if (payloadKey && payloadKey in event.properties) {
    const { [payloadKey]: payload, ...metadata } = event.properties
    const filtered = redactPreviewURLs({
      ...event,
      properties: metadata,
    }) as typeof event
    filtered.properties[payloadKey] = payload
    return filtered
  }
  return redactPreviewURLs(event) as typeof event
}
