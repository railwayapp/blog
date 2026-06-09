import { PostList } from "@components/PostList"
import Page from "@layouts/Page"
import {
  getCategories,
  getCategoryPath,
  getCategoryRouteSlug,
  getPostsByCategorySlug,
} from "@lib/cms"
import { BlogCategory, BlogPost } from "@lib/types"
import { GetStaticPaths, GetStaticProps, NextPage } from "next"

export interface Props {
  categories: BlogCategory[]
  category: BlogCategory
  posts: BlogPost[]
}

const CategoryPage: NextPage<Props> = ({
  categories = [],
  category,
  posts = [],
}) => {
  return (
    <Page
      seo={{
        title: category?.seoTitle ?? `${category?.title ?? "Blog"} - Railway Blog`,
        description: category?.seoDescription ?? category?.description ?? undefined,
      }}
    >
      {category && (
        <PostList
          posts={posts}
          categories={categories}
          category={category}
        />
      )}
    </Page>
  )
}

export const getStaticProps: GetStaticProps = async (props) => {
  const categorySlug = props.params?.category

  if (typeof categorySlug !== "string") {
    return {
      notFound: true,
    }
  }

  const cmsSlug = getCategoryRouteSlug(categorySlug)
  const categories = await getCategories()
  const category = categories.find((item) => item.slug === cmsSlug)

  if (!category) {
    return {
      notFound: true,
    }
  }

  const posts = await getPostsByCategorySlug(category.slug)

  return {
    props: { posts, categories, category },
    revalidate: 900,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const categories = await getCategories()

  return {
    paths: categories.map((category) => getCategoryPath(category)),
    fallback: "blocking",
  }
}

export default CategoryPage
