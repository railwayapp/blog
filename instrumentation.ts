import { registerOTel } from "@vercel/otel"
import { redactSpanProcessor } from "./lib/tracing/redaction"

export function register() {
  // Railway supplies the collector configuration at runtime. Local development
  // and builds stay quiet unless a collector is explicitly configured.
  if (
    !process.env.OTEL_EXPORTER_OTLP_ENDPOINT &&
    !process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
  )
    return

  const cmsOrigin = new URL(
    process.env.CMS_API_URL || "https://cms.railway.com"
  ).origin

  registerOTel({
    // Follow an incoming unsampled trace even when Railway uses its default rate.
    traceSampler: process.env.OTEL_TRACES_SAMPLER
      ? "auto"
      : "parentbased_always_on",
    attributes: process.env.OTEL_SERVICE_VERSION
      ? { "service.version": process.env.OTEL_SERVICE_VERSION }
      : {},
    instrumentationConfig: {
      fetch: {
        propagateContextUrls: [`${cmsOrigin}/`],
      },
    },
    spanProcessors: [redactSpanProcessor, "auto"],
  })
}
