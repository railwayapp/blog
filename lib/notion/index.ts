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
  let startCursor: string | undefined
  const results: PostProps[] = []

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
      start_cursor: startCursor,
    })

    results.push(...(response.results as unknown as PostProps[]))
    startCursor = response.next_cursor ?? undefined
  } while (startCursor != null)

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
  let startCursor: string | undefined
  const results: Block[] = []

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: startCursor,
    })

    results.push(...response.results)
    startCursor = response.next_cursor ?? undefined
  } while (startCursor != null)

  return results
}

export const mapDatabaseToPaths = (database: PostProps[]) => {
  return database.map((item) => {
    return { params: { slug: item.properties.Slug.rich_text[0].plain_text } }
  })
}

export const mapDatabaseItemToPageProps = async (id: string) => {
  const page = await getPage(id)
  const blocks = await getBlocks(id)

  const parsedBlocks = []
  for (const block of blocks) {
    // @ts-ignore: Current client version does not support `column_list` but API does
    if (block.type === "column_list") {
      const typedBlock = block as unknown as Block
      const columnListChildren = await getBlocks(typedBlock.id)
      const columnData = await Promise.all(
        columnListChildren.map(async (c) => ({
          ...c,
          column: await getBlocks(c.id),
        }))
      )

      const parsedBlock = {
        ...typedBlock,
        [typedBlock.type]: {
          ...typedBlock[typedBlock.type],
          children: columnData,
        },
      }

      parsedBlocks.push(parsedBlock)

      continue
    }

    if (block.has_children && !block[block.type].children) {
      const childBlocks = await getBlocks(block.id)

      const parsedBlock = {
        ...block,
        [block.type]: {
          ...block[block.type],
          children: childBlocks,
        },
      }

      parsedBlocks.push(parsedBlock)
      continue
    }

    parsedBlocks.push(block)
  }

  return { page, blocks: parsedBlocks }
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
  const block = await notion.blocks.retrieve({ block_id: blockId })

  if (block.type !== "image" && block.type !== "video") {
    throw new Error("Block is not an image or video")
  }

  const image = block[block.type] as FileWithCaption | ExternalFileWithCaption

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
