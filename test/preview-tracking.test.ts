import {
  filterPreviewEvent,
  hasPreviewURL,
  setPreviewTransition,
} from "@lib/preview-tracking"
const preview = "/p/post?cmsPreview=secret"
const event = (properties = {}, name = "$pageview") =>
  ({
    event: name,
    properties: {
      $current_url: "https://blog.railway.com/p/public",
      ...properties,
    },
  } as any)
beforeEach(() => {
  window.history.replaceState({}, "", "/")
  setPreviewTransition(false)
})
it.each([preview, "/p/post?cmsPreview=", "/preview/p/post"])(
  "recognizes preview context %s",
  (url) => {
    expect(hasPreviewURL(url)).toBe(true)
    window.history.replaceState({}, "", url)
    expect(filterPreviewEvent(event())).toBeNull()
  }
)
it("blocks capture before preview DOM arrives and rejects deferred preview events", () => {
  setPreviewTransition(true)
  expect(filterPreviewEvent(event())).toBeNull()
  setPreviewTransition(false)
  expect(filterPreviewEvent(event({ $current_url: preview }))).toBeNull()
  expect(filterPreviewEvent(event())).not.toBeNull()
})
it("removes preview URLs from public referrer and session properties", () => {
  const result = filterPreviewEvent(
    event({
      $referrer: preview,
      nested: { previous: preview, public: "/p/public" },
      list: [preview, "safe"],
    })
  ) as any
  expect(result.properties.$referrer).toBeUndefined()
  expect(result.properties.nested).toEqual({ public: "/p/public" })
  expect(result.properties.list).toEqual([null, "safe"])
})
it.each([
  ["$snapshot", "$snapshot_data"],
  ["$$heatmap", "$heatmap_data"],
])("preserves opaque %s buffers", (name, key) => {
  const buffer = [{ data: "sdk data" }]
  const result = filterPreviewEvent(
    event({ [key]: buffer, $referrer: preview }, name)
  ) as any
  expect(result.properties[key]).toBe(buffer)
  expect(result.properties.$referrer).toBeUndefined()
})
