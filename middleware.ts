import { NextRequest, NextResponse } from "next/server"
import { previewHeaders } from "./lib/cms/preview"

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  if (!url.searchParams.has("cmsPreview")) return NextResponse.next()

  // Presence, including empty/duplicate tokens, must bypass the published cache.
  // Markdown exports remain published-only; a preview token is never an export credential.
  if (!/^\/p\/[^/]+$/.test(url.pathname) || url.pathname.endsWith(".md")) {
    return new NextResponse(
      "Preview unavailable. Open the original preview link.",
      {
        status: 404,
        headers: previewHeaders,
      }
    )
  }

  const destination = url.clone()
  destination.pathname = `/preview${url.pathname}`
  return NextResponse.rewrite(destination, { headers: previewHeaders })
}

export const config = { matcher: ["/p/:path*"] }
