import { FullLoading } from "@components/Loading"
import { PostPage } from "@layouts/PostPage"
import { getPostBySlug, getRelatedPosts } from "@lib/cms"
import { BlogPost } from "@lib/types"
import { GetStaticPaths, GetStaticProps, NextPage } from "next"
import ErrorPage from "next/error"
import { useRouter } from "next/router"

export interface Props {
  page: BlogPost
  relatedPosts: BlogPost[]
}

const Post: NextPage<Props> = ({ page, relatedPosts }) => {
  const router = useRouter()

  if (!router.isFallback && page == null) {
    return <ErrorPage statusCode={404} />
  }

  if (router.isFallback) {
    return <FullLoading />
  }

  return <PostPage post={page} relatedPosts={relatedPosts} />
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  }
}

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const slug = context.params?.slug

  if (typeof slug !== "string") {
    return {
      notFound: true,
      revalidate: 60,
    }
  }

  const post = await getPostBySlug(slug)

  if (post == null) {
    // Without a lease the 404 is cached until the next deploy, and content
    // now ships without deploys: one hit on a not-yet-published slug would
    // otherwise pin the URL at 404 after the post goes live.
    return {
      notFound: true,
      revalidate: 60,
    }
  }

  let relatedPosts: BlogPost[] = []
  try {
    relatedPosts = await getRelatedPosts(post)
  } catch (error) {
    console.warn("Failed to fetch related posts:", error)
  }

  return {
    props: {
      page: post,
      relatedPosts,
    },
    revalidate: 60,
  }
}

export default Post
