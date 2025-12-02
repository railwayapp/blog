import { GetServerSideProps } from "next"
import { getDatabase } from "@lib/notion"
import { generateRssFeedXml } from "@lib/rss"

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  if (process.env.POSTS_TABLE_ID == null) {
    return {
      notFound: true,
    }
  }

  const posts = await getDatabase(process.env.POSTS_TABLE_ID)
  const xml = await generateRssFeedXml(posts)

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8")
  res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=300")
  res.write(xml)
  res.end()

  return {
    props: {},
  }
}

// @ts-ignore: Default export to prevent next.js errors
const RssPage = () => {
  // Weird NextJS thing - getServerSideProps handles the response
}
export default RssPage

