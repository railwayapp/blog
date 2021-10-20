import { getServerSideSitemap } from "next-sitemap"
import { GetServerSideProps } from "next"

import { getDatabase, getBlogLink } from "@lib/notion"

const ROOT_URL = "https://blog.railway.app"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const posts = await getDatabase(process.env.POSTS_TABLE_ID)

  const paths = posts.map((post) => {
    return {
      loc: ROOT_URL + getBlogLink(post.properties.Slug.rich_text[0].plain_text),
      lastmod: new Date().toISOString(),
    }
  })

  const fields = [
    {
      loc: ROOT_URL,
      lastmod: new Date().toISOString(),
    },
    ...paths,
  ]

  return getServerSideSitemap(ctx, fields)
}

// @ts-ignore: Default export to prevent next.js errors
const SitemapPage = () => {
  // Weird NextJS thing
}
export default SitemapPage
