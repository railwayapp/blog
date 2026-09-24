/** @jest-environment node */
import { SpanStatusCode, trace } from "@opentelemetry/api"
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base"
import { traceCMS } from "@lib/tracing"
import { redactSpanProcessor } from "@lib/tracing/redaction"

const exporter = new InMemorySpanExporter()
const provider = new BasicTracerProvider({
  spanProcessors: [redactSpanProcessor, new SimpleSpanProcessor(exporter)],
})

beforeAll(() => trace.setGlobalTracerProvider(provider))
beforeEach(() => exporter.reset())
afterAll(async () => {
  await provider.shutdown()
  trace.disable()
})

test("redacts URL queries before completed spans reach the exporter", async () => {
  const url =
    "https://cms.railway.com/api/content-preview?token=private-token&path=/p/draft"
  const span = provider.getTracer("test").startSpan(`GET ${url}`, {
    attributes: {
      "http.url": url,
      "http.target": "/p/draft?c%6dsPreview=private-token",
      "url.query": "secret=private-token",
      "test.urls": [url],
      "http.response.status_code": 503,
    },
  })
  span.recordException(new Error(`Failed to fetch ${url}`))
  span.setStatus({ code: SpanStatusCode.ERROR, message: `Failed: ${url}` })
  span.end()
  await provider.forceFlush()

  const [exported] = exporter.getFinishedSpans()
  expect(exported.name).toBe(
    "GET https://cms.railway.com/api/content-preview?[REDACTED]"
  )
  expect(exported.attributes["http.target"]).toBe("/p/draft?[REDACTED]")
  expect(exported.attributes["http.response.status_code"]).toBe(503)
  expect(
    JSON.stringify({
      name: exported.name,
      attributes: exported.attributes,
      events: exported.events,
      status: exported.status,
    })
  ).not.toContain("private-token")
})

test("CMS work returns its result and exports useful counts", async () => {
  const result = await traceCMS(
    "cms.list",
    { "cms.collection": "posts" },
    async (span) => {
      span.setAttribute("cms.document_count", 2)
      return ["first", "second"]
    }
  )
  await provider.forceFlush()
  expect(result).toEqual(["first", "second"])
  expect(exporter.getFinishedSpans()[0].attributes).toEqual({
    "cms.collection": "posts",
    "cms.document_count": 2,
  })
})

test("CMS failures preserve the thrown error but export no upstream body", async () => {
  const error = new Error("Upstream body with private-token")
  await expect(
    traceCMS("cms.request", {}, async () => {
      throw error
    })
  ).rejects.toBe(error)
  await provider.forceFlush()
  const [span] = exporter.getFinishedSpans()
  expect(span.status.code).toBe(SpanStatusCode.ERROR)
  expect(JSON.stringify(span.events)).not.toContain("private-token")
  expect(span.events[0].attributes?.["exception.message"]).toBe(
    "CMS operation failed"
  )
})
