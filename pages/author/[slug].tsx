import { PostList } from "@components/PostList"
import { url } from "@components/Seo"
import Page from "@layouts/Page"
import {
  getAuthorPath,
  getAuthorsFromPosts,
  getCategories,
  getPosts,
  getPostsByAuthorSlug,
} from "@lib/cms"
import {
  buildSeoTitle,
  generateCollectionPageSchema,
  generateHubBreadcrumbSchema,
  generatePersonSchema,
} from "@lib/seo-components"
import { BlogAuthor, BlogCategory, BlogPost } from "@lib/types"
import { GetStaticPaths, GetStaticProps, NextPage } from "next"

export interface Props {
  author: BlogAuthor
  categories: BlogCategory[]
  posts: BlogPost[]
}

export const authorDescription = (author: BlogAuthor, postCount: number) =>
  `${postCount} ${postCount === 1 ? "post" : "posts"} by ${author.name}` +
  `${author.title ? `, ${author.title}` : ""} at Railway, on the Railway Blog.`

// Author pages give each byline a stable URL, so the Person in every post's
// BlogPosting JSON-LD resolves to a real page listing that author's work.
const AuthorPage: NextPage<Props> = ({
  author,
  categories = [],
  posts = [],
}) => {
  const pageUrl = `${url}${getAuthorPath(author.slug ?? "")}`
  const description = authorDescription(author, posts.length)

  return (
    <Page
      seo={{
        title: buildSeoTitle(author.name),
        description,
        currentUrl: pageUrl,
        schemas: [
          generateCollectionPageSchema({
            name: author.name,
            description,
            url: pageUrl,
            posts,
            about: generatePersonSchema(author),
          }),
          generateHubBreadcrumbSchema(author.name, pageUrl),
        ],
      }}
    >
      <PostList posts={posts} categories={categories} category={author.name} />
    </Page>
  )
}

export const getStaticProps: GetStaticProps = async (props) => {
  const slug = props.params?.slug

  if (typeof slug !== "string") {
    return { notFound: true, revalidate: 5 }
  }

  const [posts, categories] = await Promise.all([
    getPostsByAuthorSlug(slug),
    getCategories(),
  ])
  const author = posts
    .flatMap((post) => post.authors)
    .find((item) => item.slug === slug)

  if (!author) {
    return { notFound: true, revalidate: 5 }
  }

  return {
    props: { author, categories, posts },
    revalidate: 5,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const authors = getAuthorsFromPosts(await getPosts())

  return {
    paths: authors
      .filter((author) => author.slug)
      .map((author) => getAuthorPath(author.slug as string)),
    fallback: "blocking",
  }
}

export default AuthorPage
