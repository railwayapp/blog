import {
  getBlogLink,
  getCategories,
  getCategoryPath,
  getPosts,
} from "@lib/cms"
import { BlogPost } from "@lib/types"
import movedGuides from "@lib/moved-guides.json"
import { GetServerSideProps } from "next"
import { getServerSideSitemap } from "next-sitemap"

const ROOT_URL = "https://blog.railway.com"

// Guides now live on railway.com/guides; their old URLs redirect there, so
// they and the guides category stay out of the sitemap.
const MOVED_GUIDE_SLUGS = new Set(movedGuides.slugs)
const MOVED_PATHS = new Set(["/guides", "/guide"])

/** Return the most recent updatedAt ISO string across the given posts. */
const latestUpdate = (posts: BlogPost[]): string | undefined => {
  if (posts.length === 0) return undefined
  return posts.reduce((latest, post) => {
    const d = post.updatedAt || post.publishedAt
    return d > latest ? d : latest
  }, posts[0].updatedAt || posts[0].publishedAt)
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  ctx.res.setHeader(
    "Cache-Control",
    "public, s-maxage=900, stale-while-revalidate=3600"
  )

  const [allPosts, allCategories] = await Promise.all([
    getPosts(),
    getCategories(),
  ])
  const posts = allPosts.filter((post) => !MOVED_GUIDE_SLUGS.has(post.slug))
  const categories = allCategories.filter(
    (category) => !MOVED_PATHS.has(getCategoryPath(category))
  )

  const postPaths = posts.map((post) => ({
    loc: ROOT_URL + getBlogLink(post.slug),
    lastmod: new Date(post.updatedAt || post.publishedAt).toISOString(),
  }))

  // Use the most recent post update for each category instead of new Date()
  const categoryPaths = categories.map((category) => {
    const categoryPosts = posts.filter(
      (post) => post.category?.slug === category.slug
    )
    const lastmod = latestUpdate(categoryPosts)
    return {
      loc: ROOT_URL + getCategoryPath(category),
      ...(lastmod && { lastmod: new Date(lastmod).toISOString() }),
    }
  })

  // Homepage lastmod = most recent post update across all posts
  const homepageLastmod = latestUpdate(posts)

  const fields = [
    {
      loc: ROOT_URL,
      ...(homepageLastmod && {
        lastmod: new Date(homepageLastmod).toISOString(),
      }),
    },
    ...categoryPaths,
    ...postPaths,
  ]

  return getServerSideSitemap(ctx, fields)
}

const SitemapPage = () => {
  return null
}

export default SitemapPage
