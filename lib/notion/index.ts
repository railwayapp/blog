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

/**
 * Minimize rich text by only keeping annotations that have actual formatting
 */
function minimizeRichText(richText: any[]): any[] {
  if (!richText || !Array.isArray(richText)) return richText
  
  return richText.map(text => {
    const { plain_text, annotations, text: textObj, href } = text
    
    // Only include annotations if there's actual formatting
    const hasFormatting = annotations && (
      annotations.bold ||
      annotations.italic ||
      annotations.strikethrough ||
      annotations.underline ||
      annotations.code ||
      (annotations.color && annotations.color !== 'default')
    )
    
    const minimized: any = {
      plain_text,
      type: text.type || 'text'
    }
    
    // Only include annotations if there's formatting
    if (hasFormatting) {
      minimized.annotations = {
        bold: annotations.bold || false,
        italic: annotations.italic || false,
        strikethrough: annotations.strikethrough || false,
        underline: annotations.underline || false,
        code: annotations.code || false,
        color: annotations.color || 'default'
      }
    }
    
    // Only include text object if it has content or a link
    if (textObj) {
      if (textObj.content || textObj.link) {
        minimized.text = {
          content: textObj.content || '',
          ...(textObj.link ? { link: { url: textObj.link.url } } : {})
        }
      }
    }
    
    // Include href if present
    if (href) {
      minimized.href = href
    }
    
    return minimized
  })
}

/**
 * Minimize a block by stripping unnecessary metadata
 */
function minimizeBlock(block: Block): any {
  const { id, type, has_children } = block
  const blockData = block[type as keyof Block] as any
  
  const minimized: any = {
    id,
    type,
    has_children
  }
  
  // Minimize based on block type - only include what's needed for rendering
  switch (type) {
    case 'paragraph':
    case 'heading_1':
    case 'heading_2':
    case 'heading_3':
      minimized[type] = {
        text: minimizeRichText(blockData.text),
        ...(blockData.children && blockData.children.length > 0
          ? { children: blockData.children.map((child: Block) => minimizeBlock(child)) }
          : {})
      }
      break
      
    case 'quote':
      minimized[type] = {
        text: minimizeRichText(blockData.text),
        ...(blockData.children && blockData.children.length > 0
          ? { children: blockData.children.map((child: Block) => minimizeBlock(child)) }
          : {})
      }
      break
      
    case 'bulleted_list_item':
    case 'numbered_list_item':
      minimized[type] = {
        text: minimizeRichText(blockData.text),
        ...(blockData.children && blockData.children.length > 0
          ? { children: blockData.children.map((child: Block) => minimizeBlock(child)) }
          : {})
      }
      break
      
    case 'callout':
      minimized[type] = {
        text: minimizeRichText(blockData.text),
        icon: blockData.icon ? {
          emoji: blockData.icon.emoji,
          type: blockData.icon.type
        } : undefined,
        ...(blockData.children && blockData.children.length > 0
          ? { children: blockData.children.map((child: Block) => minimizeBlock(child)) }
          : {})
      }
      break
      
    case 'image':
    case 'video':
      minimized[type] = {
        type: blockData.type,
        ...(blockData.type === 'external'
          ? { external: { url: blockData.external.url } }
          : {
              file: {
                url: blockData.file.url,
                expiry_time: blockData.file.expiry_time
              }
            }),
        ...(blockData.caption && blockData.caption.length > 0
          ? { caption: minimizeRichText(blockData.caption) }
          : {})
      }
      break
      
    case 'code':
      minimized[type] = {
        text: blockData.text ? minimizeRichText(blockData.text) : [],
        language: blockData.language || 'plain text',
        ...(blockData.caption && blockData.caption.length > 0
          ? { caption: minimizeRichText(blockData.caption) }
          : {})
      }
      break
      
    case 'divider':
      // Divider has no content
      minimized[type] = {}
      break
      
    case 'embed':
      minimized[type] = {
        url: blockData.url,
        ...(blockData.caption && blockData.caption.length > 0
          ? { caption: minimizeRichText(blockData.caption) }
          : {})
      }
      break
      
    case 'table':
      minimized[type] = {
        has_column_header: blockData.has_column_header || false,
        has_row_header: blockData.has_row_header || false,
        ...(blockData.children && blockData.children.length > 0
          ? { children: blockData.children.map((child: Block) => minimizeBlock(child)) }
          : {})
      }
      break
      
    case 'table_row':
      minimized[type] = {
        cells: blockData.cells ? blockData.cells.map((cell: any[]) => minimizeRichText(cell)) : []
      }
      break
      
    case 'column_list':
      minimized[type] = {
        children: blockData.children ? blockData.children.map((child: Block) => minimizeBlock(child)) : []
      }
      break
      
    case 'column':
      // Column blocks can have either 'children' or 'column' property
      if (blockData.column) {
        minimized[type] = {
          column: blockData.column.map((child: Block) => minimizeBlock(child))
        }
      } else if (blockData.children) {
        minimized[type] = {
          children: blockData.children.map((child: Block) => minimizeBlock(child))
        }
      } else {
        minimized[type] = {}
      }
      break
      
    default:
      // For unknown types, try to minimize text if present
      if (blockData.text) {
        minimized[type] = {
          text: minimizeRichText(blockData.text),
          ...(blockData.children && blockData.children.length > 0
            ? { children: blockData.children.map((child: Block) => minimizeBlock(child)) }
            : {})
        }
      } else {
        minimized[type] = blockData
      }
  }
  
  return minimized
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
    let parsedBlock: Block
    
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

      parsedBlock = {
        ...typedBlock,
        [typedBlock.type]: {
          ...typedBlock[typedBlock.type],
          children: columnData,
        },
      } as Block

    } else if (block.has_children && !block[block.type as keyof Block]?.children) {
      const childBlocks = await getBlocks(block.id)

      parsedBlock = {
        ...block,
        [block.type]: {
          ...block[block.type as keyof Block],
          children: childBlocks,
        },
      } as Block
    } else {
      parsedBlock = block
    }
    
    // Minimize the block before adding to reduce serialized size
    parsedBlocks.push(minimizeBlock(parsedBlock))
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

  if (currList != null) {
    updatedBlocks.push(currList);
  }

  return updatedBlocks
}
