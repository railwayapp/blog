import { PostList } from "@components/PostList"
import { url } from "@components/Seo"
import Page from "@layouts/Page"
import {
  getCategories,
  getCategoryLabel,
  getCategoryPath,
  getCategoryRouteSlug,
  getPostsByCategorySlug,
} from "@lib/cms"
import {
  buildSeoTitle,
  generateCollectionPageSchema,
  generateHubBreadcrumbSchema,
  getCategoryDescription,
} from "@lib/seo-components"
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
  const pageUrl = category ? `${url}${getCategoryPath(category)}` : undefined
  const label = category ? getCategoryLabel(category) : "Blog"
  const description = category ? getCategoryDescription(category) : undefined

  return (
    <Page
      seo={{
        title:
          category?.seoTitle ??
          buildSeoTitle(
            category ? getCategoryLabel(category) : "Blog"
          ),
        description,
        // The canonical is derived from the category, so the legacy /guide
        // alias canonicalizes to /guides instead of duplicating it.
        currentUrl: pageUrl,
        schemas: pageUrl
          ? [
              generateCollectionPageSchema({
                name: `${label} | Railway Blog`,
                description,
                url: pageUrl,
                posts,
              }),
              generateHubBreadcrumbSchema(label, pageUrl),
            ]
          : [],
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
      revalidate: 5,
    }
  }

  const cmsSlug = getCategoryRouteSlug(categorySlug)
  const categories = await getCategories()
  const category = categories.find((item) => item.slug === cmsSlug)

  if (!category) {
    // Same lease as the success path: a category created in the CMS would
    // otherwise stay a cached 404 until the next deploy.
    return {
      notFound: true,
      revalidate: 5,
    }
  }

  const posts = await getPostsByCategorySlug(category.slug)

  return {
    props: { posts, categories, category },
    revalidate: 5,
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
