import {
  FileWithCaption,
  ExternalFileWithCaption,
} from "@notionhq/client/build/src/api-types"
import { Client } from "@notionhq/client"
import { PostProps } from "@lib/types"

const notion = new Client({
  auth: process.env.NOTION_API_TOKEN,
})

/**
 * Get Notion database
 * @param databaseId ID of the collection to query
 * @returns A list of published posts from the collection
 */
export const getDatabase = async (databaseId: string) => {
  const response = await notion.databases.query({
    database_id: databaseId,
  })

  const results = response.results as unknown as PostProps[]

  return results.filter((result) => result.properties.Published.checkbox)
}

export const getPage = async (pageId: string) => {
  const response = await notion.pages.retrieve({ page_id: pageId })

  return response as unknown as PostProps
}

export const getBlocks = async (blockId: string) => {
  const response = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 50,
  })
  return response.results
}

export const mapDatabaseToPaths = (database: PostProps[]) => {
  return database.map((item) => {
    return { params: { slug: item.properties.Slug.rich_text[0].plain_text } }
  })
}

export const mapDatabaseItemToPageProps = async (id: string) => {
  const page = await getPage(id)
  const blocks = await getBlocks(id)

  const childBlocks = await Promise.all(
    blocks
      .filter((block) => block.has_children)
      .map(async (block) => {
        return {
          id: block.id,
          children: await getBlocks(block.id),
        }
      })
  )

  const blocksWithChildren = blocks.map((block) => {
    if (block.has_children && !block[block.type].children) {
      block[block.type]["children"] = childBlocks.find(
        (childBlock) => (childBlock.id = block.id)
      )?.children
    }

    return block
  })

  return { page, blocks: blocksWithChildren }
}

export const getMediaProperties = (
  value: FileWithCaption | ExternalFileWithCaption
) => {
  const source = value.type === "external" ? value.external.url : value.file.url
  const caption =
    value.caption && value.caption.length > 0 ? value.caption[0].plain_text : ""

  return { source, caption }
}

export const getBlogLink = (slug: string) => {
  return `/p/${slug}`
}
