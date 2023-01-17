import { GetStaticPaths, GetStaticProps, NextPage } from "next"
import { useRouter } from "next/router"
import { Block } from "@notionhq/client/build/src/api-types"
import ErrorPage from "next/error"
import { Fragment, useMemo } from "react"

import { PostPage } from "@layouts/PostPage"
import { PostProps } from "@lib/types"
import {
  getDatabase,
  mapDatabaseItemToPageProps,
  mapDatabaseToPaths,
} from "@lib/notion"

import { RenderBlock } from "@components/RenderBlock"
import { FullLoading } from "@components/Loading"
import { NotionList } from "../../components/NotionText"

export interface Props {
  page: PostProps
  relatedPosts: PostProps[]
  blocks: Block[]
}

interface ListBlock {
  id: string
  type: string
  items: Block[]
}

const Post: NextPage<Props> = ({ page, relatedPosts, ...props }) => {
  const router = useRouter()

  // Group all list items together so we can group in a <ul />
  const blocks = useMemo(() => {
    const updatedBlocks: Array<Block | ListBlock> = []
    let currList: ListBlock | null = null

    for (const b of props.blocks ?? []) {
      if (b.type === "bulleted_list_item" || b.type === "numbered_list_item") {
        if (currList == null)
          currList = {
            id: b.id,
            type: b.type === "bulleted_list_item" ? "ul" : "ol",
            items: [],
          }
        currList.items.push(b)
      } else {
        if (currList != null) {
          updatedBlocks.push(currList)
          currList = null
        }

        updatedBlocks.push(b)
      }
    }

    return updatedBlocks
  }, [props.blocks])

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
          return (
            <NotionList key={block.id} type={(block as ListBlock).type}>
              {(block as ListBlock).items.map((block) => (
                <Fragment key={block.id}>
                  <RenderBlock block={block} />
                </Fragment>
              ))}
            </NotionList>
          )
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

  const posts = await getDatabase(process.env.POSTS_TABLE_ID)

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

  const posts = await getDatabase(process.env.POSTS_TABLE_ID)
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
            post.properties.Category?.select?.name === category
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
