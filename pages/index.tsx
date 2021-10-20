import { GetStaticProps, NextPage } from "next"

import { PostProps } from "@lib/types"
import { getDatabase } from "@lib/notion"

import Page from "@layouts/Page"
import PostItem from "@components/PostItem"

export interface Props {
  posts: PostProps[]
  preview: boolean
}
const Home: NextPage<Props> = ({ posts = [] }) => {
  return (
    <Page>
      <div className="max-w-5xl px-4 mx-auto">
        <header className="py-24">
          <h1 className="text-6xl font-bold text-center leading-10">
            Railway Blog
          </h1>
        </header>

        {posts.length === 0 ? (
          <div className="text-center text-gray-500">Pretty empty here</div>
        ) : (
          <div className="posts max-w-5xl">
            {posts.map((p) => (
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

  return {
    props: { posts },
    revalidate: 900, // 15 minutes
  }
}

export default Home
