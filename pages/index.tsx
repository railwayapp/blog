import { PostList } from "@components/PostList"
import Page from "@layouts/Page"
import { url } from "@components/Seo"
import { getCategories, getPosts } from "@lib/cms"
import {
  BLOG_DESCRIPTION,
  generateCollectionPageSchema,
} from "@lib/seo-components"
import { BlogCategory, BlogPost } from "@lib/types"
import { GetStaticProps, NextPage } from "next"

export interface Props {
  categories: BlogCategory[]
  posts: BlogPost[]
  preview: boolean
}

const Home: NextPage<Props> = ({ categories = [], posts = [] }) => {
  return (
    <Page
      seo={{
        schemas: [
          generateCollectionPageSchema({
            name: "Railway Blog",
            description: BLOG_DESCRIPTION,
            url,
            posts,
          }),
        ],
      }}
    >
      {/* The design has no visible page title, but every page needs exactly
          one h1 for crawlers and screen readers. */}
      <h1 className="sr-only">Railway Blog</h1>
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
