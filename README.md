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

## Running Locally

- Make sure you have `yarn`.
- Run `yarn install`.
- Add `CMS_API_KEY` to `.env.local`.
- Run `yarn dev`.
