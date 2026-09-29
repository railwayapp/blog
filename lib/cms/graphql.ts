import { cmsTraceHeaders, traceCMS } from "@lib/tracing"
import type { TypedDocumentString } from "./generated/graphql"

const DEFAULT_CMS_API_URL = "https://cms.railway.com"
const RETRY_DELAYS_MS = [500, 1500]
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504])

export class CMSGraphQLReadError extends Error {
  constructor(readonly status: number, operation: string) {
    super(`Railway CMS GraphQL ${operation} failed (${status})`)
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)

const errorStatus = (error: unknown): number => {
  const code =
    isRecord(error) && isRecord(error.extensions)
      ? error.extensions.statusCode
      : undefined
  return typeof code === "number" &&
    Number.isInteger(code) &&
    code >= 400 &&
    code < 600
    ? code
    : 502
}

/** All operations are reads. Preview tokens are sent without a service key. */
export const cmsQuery = async <
  T extends { result?: unknown },
  V extends Record<string, unknown>
>(
  operation: { name: string; document: TypedDocumentString<T, V> },
  variables: V,
  {
    authenticate = true,
    retries = true,
    timeout = 30_000,
  }: { authenticate?: boolean; retries?: boolean; timeout?: number } = {}
): Promise<NonNullable<T["result"]>> =>
  traceCMS(
    "cms.request",
    { "cms.path": "/api/graphql", "cms.operation.name": operation.name },
    async (span) => {
      const url = new URL(
        "/api/graphql",
        process.env.CMS_API_URL || DEFAULT_CMS_API_URL
      )
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-CMS-Client": "blog",
      }
      if (authenticate) {
        const key = process.env.CMS_API_KEY
        if (!key)
          throw new Error(
            "CMS_API_KEY is required to fetch Railway CMS content"
          )
        headers.Authorization = `Bearer ${key}`
      }

      for (let attempt = 0; ; attempt++) {
        span.setAttribute("cms.attempts", attempt + 1)
        const retryDelay = retries ? RETRY_DELAYS_MS[attempt] : undefined
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: cmsTraceHeaders(headers),
            body: JSON.stringify({
              query: operation.document.toString(),
              operationName: operation.name,
              variables,
            }),
            cache: "no-store",
            redirect: "error",
            signal: AbortSignal.timeout(timeout),
          })
          span.setAttribute("http.response.status_code", response.status)
          if (!response.ok)
            throw new CMSGraphQLReadError(response.status, operation.name)

          const body: unknown = await response.json().catch(() => {
            throw new CMSGraphQLReadError(502, operation.name)
          })
          if (
            !isRecord(body) ||
            (body.errors !== undefined && !Array.isArray(body.errors))
          )
            throw new CMSGraphQLReadError(502, operation.name)
          if (Array.isArray(body.errors) && body.errors.length) {
            const statuses = body.errors.map(errorStatus)
            // A partial result or an upstream failure must never become a cached 404.
            throw new CMSGraphQLReadError(
              statuses.find((status) => status >= 500) ?? statuses[0],
              operation.name
            )
          }
          if (!isRecord(body.data) || body.data.result == null)
            throw new CMSGraphQLReadError(502, operation.name)
          return body.data.result as NonNullable<T["result"]>
        } catch (error) {
          if (
            retryDelay == null ||
            (error instanceof CMSGraphQLReadError &&
              !RETRYABLE_STATUSES.has(error.status))
          )
            throw error
          // Keep variables, tokens, credentials, and upstream bodies out of logs.
          console.warn(
            `Railway CMS GraphQL ${operation.name} unavailable; retrying in ${retryDelay}ms`
          )
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay + Math.random() * 250)
          )
        }
      }
    }
  )
