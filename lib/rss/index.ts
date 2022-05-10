import { Feed } from "feed"
import { writeFileSync } from "fs"

import { PostProps } from "@lib/types"

export const generateRssFeed = (posts: PostProps[]) => {
  const baseUrl = "https://blog.railway.app"
  const author = {
    name: "Railway",
    email: "contact@railway.app",
    link: "https://twitter.com/Railway",
  }

  const feed = new Feed({
    title: "Railway Blog",
    description:
      "A series of posts ranging from deployment tutorials to deep engineering adventures to how the team works and builds Railway.",
    id: baseUrl,
    link: baseUrl,
    language: "en",
    feedLinks: {
      rss2: `${baseUrl}/rss.xml`,
    },
    author,
    copyright: "Copyright © 2022 Railway Corp.",
  })

  posts.forEach((post) => {
    const url = baseUrl + "/p/" + post.properties.Slug.rich_text[0].plain_text
    feed.addItem({
      title: post.properties.Page.title[0].plain_text,
      description: post.properties.Description.rich_text[0].plain_text,
      id: url,
      link: url,
      date: new Date(post.properties.Date.date.start),
    })
  })

  writeFileSync(`public/rss.xml`, feed.rss2())
}
