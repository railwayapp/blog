import type { Attributes, AttributeValue } from "@opentelemetry/api"
import type { SpanProcessor } from "@opentelemetry/sdk-trace-base"

// Preview URLs and the revalidation endpoint carry credentials in their query
// strings. Next.js and fetch include these URLs in spans and exception messages.
export const redactTraceText = (value: string) =>
  value.replace(/\?[^#\s"'<>]*/g, "?[REDACTED]")

const redactValue = (value: AttributeValue): AttributeValue => {
  if (typeof value === "string") return redactTraceText(value)
  if (Array.isArray(value))
    return value.map((item) =>
      typeof item === "string" ? redactTraceText(item) : item
    ) as AttributeValue
  return value
}

const redactAttributes = (attributes: Attributes) => {
  for (const [key, value] of Object.entries(attributes)) {
    if (value !== undefined)
      attributes[key] = key === "url.query" ? "[REDACTED]" : redactValue(value)
  }
}

export const redactSpanProcessor: SpanProcessor = {
  onStart() {
    // Attributes may still be added until the span ends.
  },
  onEnd(span) {
    // Run before the SDK's export processors: setters stop accepting changes
    // once a span ends, so sanitize the completed span's export data in place.
    Object.assign(span, { name: redactTraceText(span.name) })
    redactAttributes(span.attributes)
    if (span.status.message)
      span.status.message = redactTraceText(span.status.message)
    for (const event of span.events) {
      event.name = redactTraceText(event.name)
      if (event.attributes) redactAttributes(event.attributes)
    }
  },
  async forceFlush() {
    // This processor has no buffer; the following exporter owns flushing.
  },
  async shutdown() {
    // No resources to release.
  },
}
