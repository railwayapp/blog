import { GetStaticPaths, GetStaticProps, NextPage } from "next"
import { useRouter } from "next/router"
import { Block } from "@notionhq/client/build/src/api-types"
import ErrorPage from "next/error"
import { Fragment } from "react"

import { PostPage } from "@layouts/PostPage"
import { PostProps } from "@lib/types"
import {
  getDatabase,
  mapDatabaseItemToPageProps,
  mapDatabaseToPaths,
} from "@lib/notion"

import { RenderBlock } from "@components/RenderBlock"
import { FullLoading } from "@components/Loading"

export interface Props {
  page: PostProps
  blocks: Block[]
}

const Post: NextPage<Props> = ({ page, blocks }) => {
  const router = useRouter()

  if (!router.isFallback && page == null) {
    return <ErrorPage statusCode={404} />
  }

  if (router.isFallback) {
    return <FullLoading />
  }

  return (
    <PostPage post={page}>
      {blocks.map((block) => (
        <Fragment key={block.id}>
          <RenderBlock block={block} />
        </Fragment>
      ))}
    </PostPage>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  if (process.env.POSTS_TABLE_ID == null) {
    return {
      paths: [],
      fallback: true,
    }
  }

  const posts = await getDatabase(process.env.POSTS_TABLE_ID)

  const paths = mapDatabaseToPaths(posts)
  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  if (process.env.POSTS_TABLE_ID == null) {
    return {
      notFound: true,
    }
  }

  const { params } = context
  if (params == null) {
    return {
      notFound: true,
    }
  }

  const posts = await getDatabase(process.env.POSTS_TABLE_ID)
  const slug = params.slug as string
  const post = posts.find((post) => {
    return post.properties.Slug.rich_text[0].plain_text === slug
  })
  if (post == null) {
    return {
      notFound: true,
    }
  }

  const props = await mapDatabaseItemToPageProps(post.id)
  return {
    props,
    revalidate: 1,
  }
}

export default Post
