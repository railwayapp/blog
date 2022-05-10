import { GetStaticProps, NextPage } from "next"

import { PostProps } from "@lib/types"
import { getDatabase } from "@lib/notion"

import Page from "@layouts/Page"
import PostItem from "@components/PostItem"
import { generateRssFeed } from "@lib/rss"

export interface Props {
  posts: PostProps[]
  preview: boolean
}
const Home: NextPage<Props> = ({ posts = [] }) => {
  return (
    <Page>
      <div className="max-w-5xl px-4 mx-auto">
        <header className="py-16 md:py-24">
          <h1 className="text-5xl md:text-6xl leading-tight font-bold text-center">
            Railway Blog
          </h1>
        </header>

        {posts.length === 0 ? (
          <div className="text-center text-gray-500">Pretty empty here</div>
        ) : (
          <div className="posts max-w-5xl">
            {posts
              .filter((p) => p.properties.Published.checkbox)
              .map((p) => (
                <PostItem key={p.id} post={p} />
              ))}
          </div>
        )}
      </div>
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
