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
 * Retry configuration
 */
const MAX_RETRIES = 5
const INITIAL_RETRY_DELAY = 1000 // 1 second
const MAX_RETRY_DELAY = 30000 // 30 seconds
const TIMEOUT_MS = 30000 // 30 seconds timeout

/**
 * In-memory cache for development mode
 * Caches API responses to avoid repeated calls during hot reloads
 */
const isDev = process.env.NODE_ENV === 'development'
const CACHE_TTL_MS = 60 * 1000 // 1 minute cache in dev

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<any>>()

function getCached<T>(key: string): T | null {
  if (!isDev) return null
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache<T>(key: string, data: T): void {
  if (!isDev) return
  cache.set(key, { data, timestamp: Date.now() })
}

/**
 * Sleep for a given number of milliseconds
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Check if an error is retryable
 */
const isRetryableError = (error: any): boolean => {
  // Retry on 502, 503, 504 (gateway/network errors) and rate limit errors
  if (error?.code === 'notionhq_client_response_error') {
    const status = error?.status || error?.message?.match(/status:\s*(\d+)/)?.[1]
    return status === 502 || status === 503 || status === 504 || status === 429
  }
  // Retry on network errors or timeouts
  if (error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT' || error?.code === 'ENOTFOUND') {
    return true
  }
  // Retry on timeout errors
  if (error?.message?.includes('timeout') || error?.message?.includes('TIMEOUT')) {
    return true
  }
  return false
}

/**
 * Execute a function with timeout
 */
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ])
}

/**
 * Retry a function with exponential backoff
 */
const withRetry = async <T>(
  fn: () => Promise<T>,
  operationName: string = 'operation'
): Promise<T> => {
  let lastError: any
  let delay = INITIAL_RETRY_DELAY

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await withTimeout(fn(), TIMEOUT_MS)
    } catch (error: any) {
      lastError = error

      // Don't retry if it's not a retryable error or we've exhausted retries
      if (!isRetryableError(error) || attempt === MAX_RETRIES) {
        throw error
      }

      // Calculate exponential backoff with jitter
      const jitter = Math.random() * 0.3 * delay // Add up to 30% jitter
      const backoffDelay = Math.min(delay + jitter, MAX_RETRY_DELAY)

      console.warn(
        `Notion API ${operationName} failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`,
        error?.message || error,
        `Retrying in ${Math.round(backoffDelay)}ms...`
      )

      await sleep(backoffDelay)
      delay *= 2 // Exponential backoff
    }
  }

  throw lastError
}

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
  const cacheKey = `database:${databaseId}:${includeUnpublished}`
  const cached = getCached<PostProps[]>(cacheKey)
  if (cached) {
    console.log(`[Cache HIT] getDatabase(${databaseId})`)
    return cached
  }

  let startCursor: string | undefined
  const results: PostProps[] = []

  do {
    const response = await withRetry(
      () => notion.databases.query({
        database_id: databaseId,
        page_size: 100,
        start_cursor: startCursor,
      }),
      `database query (cursor: ${startCursor || 'initial'})`
    )

    results.push(...(response.results as unknown as PostProps[]))
    startCursor = response.next_cursor ?? undefined
  } while (startCursor != null)

  const filtered = results
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

  setCache(cacheKey, filtered)
  return filtered
}

/**
 * Get a single post by slug using a filtered Notion database query.
 * Much faster than getDatabase() since it only fetches the matching post
 * instead of paginating through the entire database.
 */
export const getPostBySlug = async (
  databaseId: string,
  slug: string
): Promise<PostProps | null> => {
  const cacheKey = `post-by-slug:${databaseId}:${slug}`
  const cached = getCached<PostProps | null>(cacheKey)
  if (cached !== null) {
    console.log(`[Cache HIT] getPostBySlug(${slug})`)
    return cached
  }

  const response = await withRetry(
    () => notion.databases.query({
      database_id: databaseId,
      page_size: 1,
      filter: {
        property: 'Slug',
        text: {
          equals: slug,
        },
      },
    }),
    `database query by slug (${slug})`
  )

  const post = (response.results[0] as unknown as PostProps) ?? null

  if (post != null) {
    // Validate the post has required fields
    const isValid =
      post.properties.Date?.date != null &&
      post.properties.Description?.rich_text?.length > 0 &&
      post.properties.Slug?.rich_text?.length > 0 &&
      post.properties.Page?.title?.length > 0 &&
      post.properties.Authors?.people?.length > 0

    if (!isValid) {
      setCache(cacheKey, null)
      return null
    }
  }

  setCache(cacheKey, post)
  return post
}

export const getPage = async (pageId: string) => {
  const cacheKey = `page:${pageId}`
  const cached = getCached<PostProps>(cacheKey)
  if (cached) {
    console.log(`[Cache HIT] getPage(${pageId})`)
    return cached
  }

  const response = await withRetry(
    () => notion.pages.retrieve({ page_id: pageId }),
    `getPage(${pageId})`
  )

  const result = response as unknown as PostProps
  setCache(cacheKey, result)
  return result
}

export const getBlocks = async (blockId: string) => {
  const cacheKey = `blocks:${blockId}`
  const cached = getCached<Block[]>(cacheKey)
  if (cached) {
    console.log(`[Cache HIT] getBlocks(${blockId})`)
    return cached
  }

  let startCursor: string | undefined
  const results: Block[] = []

  do {
    const response = await withRetry(
      () => notion.blocks.children.list({
        block_id: blockId,
        page_size: 100,
        start_cursor: startCursor,
      }),
      `getBlocks(${blockId}, cursor: ${startCursor || 'initial'})`
    )

    results.push(...response.results)
    startCursor = response.next_cursor ?? undefined
  } while (startCursor != null)

  setCache(cacheKey, results)
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
function minimizeBlock(block: Block | any): any {
  const { id, type, has_children } = block
  const blockData = block[type as keyof Block] as any
  
  const minimized: any = {
    id,
    type,
    has_children
  }
  
  // Minimize based on block type - only include what's needed for rendering
  // Use string comparison instead of switch to handle all block types
  const blockType = type as string
  
  if (blockType === 'paragraph' || blockType === 'heading_1' || blockType === 'heading_2' || blockType === 'heading_3') {
    minimized[type] = {
      text: minimizeRichText(blockData.text),
      ...(blockData.children && blockData.children.length > 0
        ? { children: blockData.children.map((child: Block | any) => minimizeBlock(child)) }
        : {})
    }
  } else if (blockType === 'quote') {
    minimized[type] = {
      text: minimizeRichText(blockData.text),
      ...(blockData.children && blockData.children.length > 0
        ? { children: blockData.children.map((child: Block | any) => minimizeBlock(child)) }
        : {})
    }
  } else if (blockType === 'bulleted_list_item' || blockType === 'numbered_list_item') {
    minimized[type] = {
      text: minimizeRichText(blockData.text),
      ...(blockData.children && blockData.children.length > 0
        ? { children: blockData.children.map((child: Block | any) => minimizeBlock(child)) }
        : {})
    }
  } else if (blockType === 'callout') {
    minimized[type] = {
      text: minimizeRichText(blockData.text),
      icon: blockData.icon ? {
        emoji: blockData.icon.emoji,
        type: blockData.icon.type
      } : undefined,
      ...(blockData.children && blockData.children.length > 0
        ? { children: blockData.children.map((child: Block | any) => minimizeBlock(child)) }
        : {})
    }
  } else if (blockType === 'image' || blockType === 'video') {
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
  } else if (blockType === 'code') {
    minimized[type] = {
      text: blockData.text ? minimizeRichText(blockData.text) : [],
      language: blockData.language || 'plain text',
      ...(blockData.caption && blockData.caption.length > 0
        ? { caption: minimizeRichText(blockData.caption) }
        : {})
    }
  } else if (blockType === 'divider') {
    // Divider has no content
    minimized[type] = {}
  } else if (blockType === 'embed') {
    minimized[type] = {
      url: blockData.url,
      ...(blockData.caption && blockData.caption.length > 0
        ? { caption: minimizeRichText(blockData.caption) }
        : {})
    }
  } else if (blockType === 'table') {
    minimized[type] = {
      has_column_header: blockData.has_column_header || false,
      has_row_header: blockData.has_row_header || false,
      ...(blockData.children && blockData.children.length > 0
        ? { children: blockData.children.map((child: Block | any) => minimizeBlock(child)) }
        : {})
    }
  } else if (blockType === 'table_row') {
    minimized[type] = {
      cells: blockData.cells ? blockData.cells.map((cell: any[]) => minimizeRichText(cell)) : []
    }
  } else if (blockType === 'column_list') {
    minimized[type] = {
      children: blockData.children ? blockData.children.map((child: Block | any) => minimizeBlock(child)) : []
    }
  } else if (blockType === 'column') {
    // Column blocks can have either 'children' or 'column' property
    if (blockData.column) {
      minimized[type] = {
        column: blockData.column.map((child: Block | any) => minimizeBlock(child))
      }
    } else if (blockData.children) {
      minimized[type] = {
        children: blockData.children.map((child: Block | any) => minimizeBlock(child))
      }
    } else {
      minimized[type] = {}
    }
  } else {
    // For unknown types, try to minimize text if present
    if (blockData && blockData.text) {
      minimized[type] = {
        text: minimizeRichText(blockData.text),
        ...(blockData.children && blockData.children.length > 0
          ? { children: blockData.children.map((child: Block | any) => minimizeBlock(child)) }
          : {})
      }
    } else if (blockData) {
      minimized[type] = blockData
    } else {
      minimized[type] = {}
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
  // Fetch page and blocks in parallel
  const [page, blocks] = await Promise.all([
    getPage(id),
    getBlocks(id)
  ])

  // Identify blocks that need children fetched
  const blocksNeedingChildren = blocks.filter(block => {
    // @ts-ignore: Current client version does not support `column_list` but API does
    if (block.type === "column_list") return true
    if (block.has_children && !(block[block.type as keyof Block] as any)?.children) return true
    return false
  })

  // Fetch all children in parallel
  const childrenMap = new Map<string, Block[] | { columns: Block[], columnChildren: Map<string, Block[]> }>()

  await Promise.all(blocksNeedingChildren.map(async (block) => {
    // Cast to any to handle column_list which isn't in the Block type but is supported by the API
    const b = block as any
    if (b.type === "column_list") {
      const columnListChildren = await getBlocks(b.id)
      // Fetch all column contents in parallel
      const columnChildrenEntries = await Promise.all(
        columnListChildren.map(async (c) => [c.id, await getBlocks(c.id)] as const)
      )
      childrenMap.set(b.id, {
        columns: columnListChildren,
        columnChildren: new Map(columnChildrenEntries)
      })
    } else {
      const children = await getBlocks(block.id)
      childrenMap.set(block.id, children)
    }
  }))

  // Build parsed blocks using prefetched children
  const parsedBlocks = blocks.map(block => {
    let parsedBlock: Block

    // Cast to any to handle column_list which isn't in the Block type but is supported by the API
    const b = block as any
    if (b.type === "column_list") {
      const childData = childrenMap.get(b.id) as { columns: Block[], columnChildren: Map<string, Block[]> }
      const columnData = childData.columns.map(c => ({
        ...c,
        column: childData.columnChildren.get(c.id) || [],
      }))

      parsedBlock = {
        ...b,
        [b.type]: {
          ...b[b.type],
          children: columnData,
        },
      } as Block

    } else if (block.has_children && !(block[block.type as keyof Block] as any)?.children) {
      const childBlocks = childrenMap.get(block.id) as Block[]

      parsedBlock = {
        ...block,
        [block.type]: {
          ...(block[block.type as keyof Block] as any),
          children: childBlocks,
        },
      } as Block
    } else {
      parsedBlock = block
    }

    // Minimize the block before adding to reduce serialized size
    return minimizeBlock(parsedBlock)
  })

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
  const block = await withRetry(
    () => notion.blocks.retrieve({ block_id: blockId }),
    `getChangelogImageSrc(${blockId})`
  )

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
