# Railway Blog

This repository contains the source code for the [Railway blog](https://blog.railway.com/). It is a [Next.js](https://nextjs.org/) app powered by the internal Railway CMS.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/EVFIqE)

## Features

- Next.js
- TypeScript
- Tailwind CSS
- Railway CMS GraphQL API

## CMS

The blog reads published posts and visible categories through named GraphQL queries
at `https://cms.railway.com/api/graphql`. Post lists omit Markdown content unless
needed for an article, feed, or export. Populated post queries use pages of up to
10 posts and follow pagination to retrieve the full list. Category routes resolve
slugs to CMS IDs before filtering posts. The CMS must have
`CMS_GRAPHQL_ENABLED=true`.

Required local environment:

```bash
CMS_API_KEY=...
```

Optional local environment:

```bash
CMS_API_URL=https://cms.railway.com
```

The CMS API key must stay server-only. Do not expose it through a `NEXT_PUBLIC_*` variable.

## GraphQL contracts

Edit the explicit queries and reusable fragments in `lib/cms/operations.graphql`,
then run `yarn generate:cms`. This validates the queries against the committed
schema snapshot and generates `lib/cms/generated/`, including result types,
variable types, and typed query strings used by the fetcher. The standard
GraphQL Code Generator CLI and client preset are configured in `codegen.yml`.
Commit the generated changes with the query changes.

`yarn check:cms` checks schema validity and rejects stale generated files without
rewriting them. It runs as part of `yarn type-check` and `yarn build`; the CMS
GraphQL GitHub workflow also runs type checking and the CMS tests. These checks
use the committed snapshot and require neither credentials nor a CMS checkout.

After a CMS schema change, refresh the snapshot and generated contracts from
the CMS's exported SDL:

```bash
cp ../mono/packages/cms/docs/graphql-schema.graphql lib/cms/schema.graphql
yarn generate:cms
```

The snapshot is a copy of the CMS's complete exported schema. Commit it with
the regenerated files. Generated files retain Code Generator's formatting so
its `--check` comparison stays consistent.

## Draft previews

The CMS post editor can share a seven-day link to the latest saved draft at
`/p/{slug}?cmsPreview={token}`. Middleware routes these requests to an uncached
server-rendered preview. The CMS validates the document-scoped token on every
request, including replacement, revocation, expiry, and slug/archive changes.
Preview reads use `CMS_API_URL` without the published-content API key or an
additional signing secret. The `BlogPreview` query calls `cmsContentPreview` and
sends the token in the POST body. Invalid links return 404; upstream failures
return 503, including GraphQL errors returned with HTTP 200.

Preview pages disable indexing, referrers, article metadata, and analytics.
Feeds, sitemaps, and Markdown/LLM exports continue reading published content only.
For local end-to-end testing, point the CMS's `CMS_BLOG_PREVIEW_ORIGIN` at
`http://localhost:3002` and the blog's `CMS_API_URL` at that CMS instance.

## Running Locally

- Make sure you have `yarn`.
- Run `yarn install`.
- Add `CMS_API_KEY` to `.env.local`.
- Run `yarn dev`.

## Tracing

The root `instrumentation.ts` registers `@vercel/otel` when an OTLP endpoint is
configured. Next.js records request and render spans, while `cms.list`,
`cms.request`, and `cms.preview` spans describe CMS work, retries, and item counts.
Outgoing CMS calls propagate W3C trace context to the configured `CMS_API_URL` and
identify the consumer with `X-CMS-Client: blog`. GraphQL request spans include
the operation name, without variables, credentials, or upstream error bodies.
URL query strings are redacted from application spans before export because
preview and revalidation URLs contain credentials. Railway's own edge spans are
managed separately by the platform.

Enable tracing for the Blog service in Railway, keep automatic instrumentation
off to avoid duplicate spans, and set these service variables:

```bash
OTEL_METRICS_EXPORTER=none
OTEL_LOGS_EXPORTER=none
```

On the next deployment Railway supplies the collector endpoint, protocol,
authentication headers, service name, version, and any configured sample rate.
Do not set a custom endpoint on Railway unless you intend to use another
collector. The SDK honors Railway's sampling configuration and the incoming
request's sampling decision. Local development does not export by default;
set `OTEL_EXPORTER_OTLP_ENDPOINT` to test against a local collector.

After deployment, send a request and open its `x-railway-trace-id` in Railway's
Traces tab. A trace reaching the app should include `service` spans below the
edge/proxy spans; a CDN cache hit can contain only an edge span.
