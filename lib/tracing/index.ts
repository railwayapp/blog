import {
  Attributes,
  context,
  propagation,
  Span,
  SpanStatusCode,
  trace,
} from "@opentelemetry/api"

export const cmsTraceHeaders = (headers: Record<string, string> = {}) => {
  const carrier = { ...headers }
  // @vercel/otel's fetch instrumentation skips propagation for unsampled spans.
  // Preserve that decision so the CMS does not start a new, sampled trace.
  propagation.inject(context.active(), carrier)
  return carrier
}

export const traceCMS = <T>(
  name: string,
  attributes: Attributes,
  work: (span: Span) => Promise<T>
) =>
  trace
    .getTracer("railway-blog")
    .startActiveSpan(name, { attributes }, async (span) => {
      try {
        return await work(span)
      } catch (error) {
        // Upstream errors can include response bodies or credential-bearing URLs.
        // Keep the original error for callers, but export a safe exception.
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: "CMS operation failed",
        })
        span.recordException({ name: "Error", message: "CMS operation failed" })
        throw error
      } finally {
        span.end()
      }
    })
