import {
  getBlogLink,
  getCategories,
  getCategoryPath,
  getPosts,
} from "@lib/cms"
import { GetServerSideProps } from "next"
import { getServerSideSitemap } from "next-sitemap"

const ROOT_URL = "https://blog.railway.com"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  ctx.res.setHeader(
    "Cache-Control",
    "public, s-maxage=900, stale-while-revalidate=3600"
  )

  const [posts, categories] = await Promise.all([getPosts(), getCategories()])
  const now = new Date().toISOString()

  const postPaths = posts.map((post) => ({
    loc: ROOT_URL + getBlogLink(post.slug),
    lastmod: new Date(post.updatedAt || post.publishedAt).toISOString(),
  }))

  const categoryPaths = categories.map((category) => ({
    loc: ROOT_URL + getCategoryPath(category),
    lastmod: now,
  }))

  const fields = [
    {
      loc: ROOT_URL,
      lastmod: now,
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
