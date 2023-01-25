import Page from "@layouts/Page"
import { getDatabase } from "@lib/notion"
import { generateRssFeed } from "@lib/rss"
import { PostProps } from "@lib/types"
import { GetStaticProps, NextPage } from "next"
import { PostList } from "../components/PostList"

export interface Props {
  posts: PostProps[]
  preview: boolean
}

const Home: NextPage<Props> = ({ posts = [] }) => {
  return (
    <Page>
      <PostList posts={posts} showCustomerStories />
    </Page>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  if (process.env.POSTS_TABLE_ID == null) {
    return {
      notFound: true,
    }
  }

  const posts = await getDatabase(process.env.POSTS_TABLE_ID)

  generateRssFeed(posts)

  return {
    props: { posts },
    revalidate: 900, // 15 minutes
  }
}

export default Home
