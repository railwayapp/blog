import { PostList } from "@components/PostList"
import Page from "@layouts/Page"
import { getCategories, getPosts } from "@lib/cms"
import { generateRssFeed } from "@lib/rss"
import { BlogCategory, BlogPost } from "@lib/types"
import { GetStaticProps, NextPage } from "next"

export interface Props {
  categories: BlogCategory[]
  posts: BlogPost[]
  preview: boolean
}

const Home: NextPage<Props> = ({ categories = [], posts = [] }) => {
  return (
    <Page>
      <PostList
        posts={posts}
        categories={categories}
        showCustomerStories
      />
    </Page>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()])

  // A failed feed rebuild keeps serving the previous rss.xml; it should
  // never block the homepage from revalidating.
  await generateRssFeed().catch((error) => {
    console.error("RSS feed generation failed:", error)
  })

  return {
    props: { posts, categories },
    revalidate: 900,
  }
}

export default Home
