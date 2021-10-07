import { getServerSideSitemap } from 'next-sitemap'
import { GetServerSideProps } from 'next'

import getBlogIndex from '@lib/notion/getBlogIndex'
import { getBlogLink } from '@lib/blog-helpers'

const ROOT_URL = 'https://blog.railway.app'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const postsTable = await getBlogIndex()

  const paths = Object.keys(postsTable)
    .filter((post) => postsTable[post].Published === 'Yes')
    .map((slug) => {
      return {
        loc: ROOT_URL + getBlogLink(slug),
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

// Default export to prevent next.js errors
// @ts-ignore
const SitemapPage = () => {
  // Weird NextJS thing
}
export default SitemapPage
