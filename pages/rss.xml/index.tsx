import { buildRssFeed } from "@lib/rss"
import { GetServerSideProps } from "next"

/**
 * Route-served RSS feed at /rss.xml.
 *
 * Using getServerSideProps (rather than a writeFileSync side-effect) so the
 * feed is always fresh, never stale on cold replicas, and cacheable at the CDN.
 */
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const xml = await buildRssFeed()

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8")
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  )
  res.write(xml)
  res.end()

  return { props: {} }
}

// Next requires a default export even though we never render anything.
const Noop = () => null
export default Noop
