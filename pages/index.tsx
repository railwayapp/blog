import { PostList } from "@components/PostList"
import Page from "@layouts/Page"
import { getCategories, getPosts } from "@lib/cms"
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
      <PostList posts={posts} categories={categories} />
    </Page>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()])

  return {
    props: { posts, categories },
    revalidate: 5,
  }
}

export default Home
