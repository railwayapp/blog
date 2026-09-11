# Railway Blog

This repository contains the source code for the [Railway blog](https://blog.railway.com/). It is a [Next.js](https://nextjs.org/) app powered by the internal Railway CMS.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/EVFIqE)

## Features

- Next.js
- TypeScript
- Tailwind CSS
- Railway CMS REST API

## CMS

The blog reads published posts and visible categories from `https://cms.railway.com/api`.

Required local environment:

```bash
CMS_API_KEY=...
```

Optional local environment:

```bash
CMS_API_URL=https://cms.railway.com
```

The CMS API key must stay server-only. Do not expose it through a `NEXT_PUBLIC_*` variable.

## Draft previews

The CMS post editor can share a seven-day link to the latest saved draft at
`/p/{slug}?cmsPreview={token}`. Middleware routes these requests to an uncached
server-rendered preview. The CMS validates the document-scoped token on every
request, including replacement, revocation, expiry, and slug/archive changes.
Preview reads use `CMS_API_URL` without the published-content API key or an
additional signing secret. Invalid links return 404; upstream failures return 503.

Preview pages disable indexing, referrers, article metadata, and analytics.
Feeds, sitemaps, and Markdown/LLM exports continue reading published content only.
Deploy this reader before the CMS adds `posts` to its shared preview collections.
For local end-to-end testing, point the CMS's `CMS_BLOG_PREVIEW_ORIGIN` at
`http://localhost:3002` and the blog's `CMS_API_URL` at that CMS instance.

## Running Locally

- Make sure you have `yarn`.
- Run `yarn install`.
- Add `CMS_API_KEY` to `.env.local`.
- Run `yarn dev`.
