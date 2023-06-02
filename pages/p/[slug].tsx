import { Block } from "@notionhq/client/build/src/api-types"
import { GetStaticPaths, GetStaticProps, NextPage } from "next"
import ErrorPage from "next/error"
import { useRouter } from "next/router"
import { Fragment, useMemo } from "react"

import { PostPage } from "@layouts/PostPage"
import {
  getDatabase,
  groupListBlocks,
  mapDatabaseItemToPageProps,
  mapDatabaseToPaths,
} from "@lib/notion"
import { ListBlock, PostProps } from "@lib/types"

import { FullLoading } from "@components/Loading"
import { RenderBlock } from "@components/RenderBlock"
import { NotionListBlock } from "../../components/ListBlock"

export interface Props {
  page: PostProps
  relatedPosts: PostProps[]
  blocks: Block[]
}

const Post: NextPage<Props> = ({ page, relatedPosts, ...props }) => {
  const router = useRouter()

  // Group all list items together so we can group in a <ul />
  const blocks = useMemo(() => groupListBlocks(props.blocks), [props.blocks])

  if (!router.isFallback && page == null) {
    return <ErrorPage statusCode={404} />
  }

  if (router.isFallback) {
    return <FullLoading />
  }

  return (
    <PostPage post={page} relatedPosts={relatedPosts}>
      {blocks.map((block) => {
        if ((block as ListBlock).items != null) {
          return <NotionListBlock key={block.id} block={block as ListBlock} />
        }

        return (
          <Fragment key={block.id}>
            <RenderBlock block={block as Block} />
          </Fragment>
        )
      })}
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

  const posts = await getDatabase(process.env.POSTS_TABLE_ID, {
    includeUnpublished: true,
  })

  const paths = mapDatabaseToPaths(posts)
  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps<Props> = async (context) => {
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

  const posts = await getDatabase(process.env.POSTS_TABLE_ID, {
    includeUnpublished: true,
  })
  const slug = params.slug as string
  const post = posts.find((post) => {
    return post.properties.Slug.rich_text[0].plain_text === slug
  })

  const category = post?.properties.Category?.select?.name
  const relatedPosts = (
    category != null
      ? posts.filter(
          (post) =>
            post.properties.Slug.rich_text[0].plain_text !== slug &&
            post.properties.Category?.select?.name === category &&
            post.properties.Published?.checkbox === true
        )
      : []
  ).slice(0, 2)

  if (post == null) {
    return {
      notFound: true,
    }
  }

  const props = await mapDatabaseItemToPageProps(post.id)
  return {
    props: {
      ...props,
      relatedPosts,
    },
    revalidate: 1,
  }
}

export default Post
