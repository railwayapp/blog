import {
  FileWithCaption,
  ExternalFileWithCaption,
  Block,
} from "@notionhq/client/build/src/api-types"
import { Client } from "@notionhq/client"
import { ListBlock, PostProps } from "@lib/types"

const notion = new Client({
  auth: process.env.NOTION_API_TOKEN,
})

/**
 * Get Notion database
 * @param databaseId ID of the collection to query
 * @returns A list of published posts from the collection
 */
export const getDatabase = async (
  databaseId: string,
  { includeUnpublished }: { includeUnpublished: boolean } = {
    includeUnpublished: false,
  }
) => {
  const response = await notion.databases.query({
    database_id: databaseId,
  })

  const results = response.results as unknown as PostProps[]

  return results
    .filter(
      (r) =>
        r.properties.Date.date != null &&
        r.properties.Description.rich_text.length > 0 &&
        r.properties.Slug.rich_text.length > 0 &&
        r.properties.Page.title.length > 0 &&
        r.properties.Authors.people.length > 0 &&
        (includeUnpublished || r.properties.Published.checkbox)
    )
    .sort((a, b) => {
      const dateA = new Date(a.properties.Date.date.start)
      const dateB = new Date(b.properties.Date.date.start)

      return dateB.getTime() - dateA.getTime()
    })
}

export const getPage = async (pageId: string) => {
  const response = await notion.pages.retrieve({ page_id: pageId })

  return response as unknown as PostProps
}

export const getBlocks = async (blockId: string) => {
  const allResults: Block[] = []
  const response = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 100,
  })

  allResults.push(...response.results)

  if (response.next_cursor != null) {
    const nextResponse = await notion.blocks.children.list({
      start_cursor: response.next_cursor,
      block_id: blockId,
      page_size: 100,
    })

    allResults.push(...nextResponse.results)
  }

  return allResults
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

export const getChangelogImageSrc = async (blockId: string) => {
  const supportedBlockType = "image"
  const block = await notion.blocks.retrieve({ block_id: blockId })

  if (block.type !== supportedBlockType) {
    throw new Error("Block is not an image")
  }

  const image = block[supportedBlockType] as
    | FileWithCaption
    | ExternalFileWithCaption

  if (image.type === "external") {
    return image.external.url
  }

  return image.file.url
}

export const groupListBlocks = (blocks: Block[]): (Block | ListBlock)[] => {
  const updatedBlocks: Array<Block | ListBlock> = []
  let currList: ListBlock | null = null

  for (const b of blocks ?? []) {
    if (b.type === "bulleted_list_item" || b.type === "numbered_list_item") {
      if (currList == null) {
        currList = {
          id: b.id,
          type: b.type === "bulleted_list_item" ? "ul" : "ol",
          items: [],
        }
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
}
