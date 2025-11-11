import { Feed } from "feed"
import { GetServerSideProps } from "next"
import { getDatabase } from "@lib/notion"
import { PostProps } from "@lib/types"

const ROOT_URL = "https://blog.railway.com"

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  if (process.env.POSTS_TABLE_ID == null) {
    return {
      notFound: true,
    }
  }

  const allPosts = await getDatabase(process.env.POSTS_TABLE_ID)
  
  const featuredPosts = allPosts.filter(
    (post) => post.properties.Featured.checkbox
  )

  const author = {
    name: "Railway",
    email: "contact@railway.com",
    link: "https://twitter.com/Railway",
  }

  const feed = new Feed({
    title: "Railway Blog - Featured Posts",
    description:
      "Featured posts from the Railway blog, ranging from deployment tutorials to deep engineering adventures to how the team works and builds Railway.",
    id: ROOT_URL,
    link: ROOT_URL,
    language: "en",
    feedLinks: {
      rss2: `${ROOT_URL}/feed`,
    },
    author,
    copyright: "Copyright © 2025 Railway Corp.",
  })

  featuredPosts.forEach((post) => {
    const url = ROOT_URL + "/p/" + post.properties.Slug.rich_text[0].plain_text
    feed.addItem({
      title: post.properties.Page.title[0].plain_text,
      description: post.properties.Description.rich_text[0].plain_text,
      id: url,
      link: url,
      date: new Date(post.properties.Date.date.start),
    })
  })

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8")
  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=600")
  res.write(feed.rss2())
  res.end()

  return {
    props: {},
  }
}

// @ts-ignore: Default export to prevent next.js errors
const FeedPage = () => {
  // Weird NextJS thing
}
export default FeedPage

