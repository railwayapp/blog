import { Block } from "@notionhq/client/build/src/api-types"
import { GetStaticPaths, GetStaticProps, NextPage } from "next"
import ErrorPage from "next/error"
import { useRouter } from "next/router"
import { Fragment, useMemo } from "react"

import { PostPage } from "@layouts/PostPage"
import {
  getDatabase,
  getPostBySlug,
  groupListBlocks,
  mapDatabaseItemToPageProps,
} from "@lib/notion"
import { ListBlock, PostProps, MinimalRelatedPost } from "@lib/types"

import { FullLoading } from "@components/Loading"
import { RenderBlock } from "@components/RenderBlock"
import { NotionListBlock } from "../../components/ListBlock"

export interface Props {
  page: PostProps
  relatedPosts: MinimalRelatedPost[]
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
    <PostPage post={page} relatedPosts={relatedPosts} blocks={blocks}>
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
  return {
    paths: [],
    fallback: 'blocking',
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

  const slug = params.slug as string

  // Use targeted slug query instead of fetching entire database.
  // This is a single Notion API call vs 3+ paginated calls for 200+ posts,
  // which avoids timeouts that cause spurious 404s.
  const post = await getPostBySlug(process.env.POSTS_TABLE_ID, slug)

  if (post == null) {
    return {
      notFound: true,
    }
  }

  // Only fetch full database for related posts (same category, published)
  const category = post.properties.Category?.select?.name
  let relatedPosts: MinimalRelatedPost[] = []

  if (category != null) {
    try {
      const posts = await getDatabase(process.env.POSTS_TABLE_ID)
      const relatedPostsFull = posts
        .filter(
          (p) =>
            p.properties.Slug.rich_text[0].plain_text !== slug &&
            p.properties.Category?.select?.name === category &&
            p.properties.Published?.checkbox === true
        )
        .slice(0, 2)

      relatedPosts = relatedPostsFull.map((post) => ({
        id: post.id,
        properties: {
          Page: post.properties.Page,
          Slug: post.properties.Slug,
          Description: post.properties.Description,
          Date: post.properties.Date,
          Authors: {
            people: post.properties.Authors.people.map((person) => ({
              name: person.name,
              avatar_url: person.avatar_url,
            })),
          },
          Category: post.properties.Category,
          Community: post.properties.Community,
        },
      }))
    } catch (error) {
      // If fetching related posts fails, still render the page without them
      console.warn('Failed to fetch related posts:', error)
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
