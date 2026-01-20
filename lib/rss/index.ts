import { Feed } from "feed"
import { writeFileSync } from "fs"
import { Block } from "@notionhq/client/build/src/api-types"
import {
  FileWithCaption,
  ExternalFileWithCaption,
} from "@notionhq/client/build/src/api-types"

import { PostProps } from "@lib/types"
import { getMediaProperties, mapDatabaseItemToPageProps } from "@lib/notion"
import { extractYoutubeId } from "utils"

/**
 * Escape a URL for use in HTML/XML attributes
 * This ensures ampersands and other special characters are properly escaped
 */
function escapeUrl(url: string): string {
  if (!url) return ""
  return url
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * Escape text content for HTML/XML
 */
function escapeHtml(text: string): string {
  if (!text) return ""
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * Find and escape ampersands in URLs within HTML content
 * This handles URLs in href/src attributes and plain text URLs
 */
function escapeAmpersandsInUrls(html: string): string {
  if (!html) return html
  
  // First, fix URLs in href and src attributes
  // Match href="..." or src="..." and escape ampersands in the URL
  html = html.replace(/(href|src)=["']([^"']+)["']/gi, (match, attr, url) => {
    // Escape ampersands that aren't already escaped
    const escapedUrl = url.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    return `${attr}="${escapedUrl}"`
  })
  
  // Also fix plain text URLs (http://, https://, or www.)
  // Match URLs that appear in text content (not in tags)
  html = html.replace(/(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi, (url) => {
    // Only escape if it contains an unescaped ampersand
    if (url.includes('&') && !url.includes('&amp;')) {
      // Escape ampersands that aren't already part of an entity
      return url.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    }
    return url
  })
  
  return html
}

/**
 * Convert rich text to HTML
 */
function richTextToHtml(text: any[]): string {
  if (!text || text.length === 0) return ""
  
  return text.map((value) => {
    const annotations = value.annotations || {}
    const content = value.text?.content || value.plain_text || ""
    const linkUrl = value.text?.link?.url || value.href
    
    let html = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/\n/g, "<br/>")
    
    // Apply formatting
    if (annotations.bold) html = `<strong>${html}</strong>`
    if (annotations.italic) html = `<em>${html}</em>`
    if (annotations.strikethrough) html = `<s>${html}</s>`
    if (annotations.underline) html = `<u>${html}</u>`
    if (annotations.code) html = `<code>${html}</code>`
    
    // Wrap in link if present
    if (linkUrl) {
      html = `<a href="${escapeUrl(linkUrl)}">${html}</a>`
    }
    
    return html
  }).join("")
}

/**
 * Convert rich text to HTML for table cells (replaces line breaks with dash)
 */
function richTextToHtmlForTableCell(text: any[]): string {
  if (!text || text.length === 0) return ""
  
  return text.map((value) => {
    const annotations = value.annotations || {}
    const content = value.text?.content || value.plain_text || ""
    const linkUrl = value.text?.link?.url || value.href
    
    let html = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/\n/g, " - ") // Replace line breaks with dash instead of <br>
    
    // Apply formatting
    if (annotations.bold) html = `<strong>${html}</strong>`
    if (annotations.italic) html = `<em>${html}</em>`
    if (annotations.strikethrough) html = `<s>${html}</s>`
    if (annotations.underline) html = `<u>${html}</u>`
    if (annotations.code) html = `<code>${html}</code>`
    
    // Wrap in link if present
    if (linkUrl) {
      html = `<a href="${escapeUrl(linkUrl)}">${html}</a>`
    }
    
    return html
  }).join("")
}

/**
 * Convert Notion blocks to HTML
 */
function blocksToHtml(blocks: Block[], baseUrl: string): string {
  let html = ""
  
  for (const block of blocks) {
    const type = (block as any).type as string
    const value = (block as any)[type] as any
    
    // Skip empty text blocks
    if (value?.text != null && value.text.length === 0) {
      continue
    }
    
    switch (type) {
      case "paragraph": {
        const textHtml = richTextToHtml(value.text || [])
        html += `<p style="margin-bottom: 1rem; line-height: 2;">${textHtml}</p>`
        
        // Render children recursively
        if (block.has_children && value.children) {
          html += `<div style="margin-left: 1rem;">${blocksToHtml(value.children, baseUrl)}</div>`
        }
        break
      }
      
      case "quote": {
        const textHtml = richTextToHtml(value?.text || [])
        html += `<blockquote style="margin: 2rem 0; padding-left: 1rem; border-left: 4px solid #e5e7eb; font-style: italic; color: #374151;">${textHtml}</blockquote>`
        
        if ((block as any).has_children && value?.children) {
          html += blocksToHtml(value.children, baseUrl)
        }
        break
      }
      
      case "heading_1": {
        const textHtml = richTextToHtml(value.text || [])
        html += `<h1 style="margin-top: 3rem; margin-bottom: 1rem; font-size: 2rem; font-weight: bold;">${textHtml}</h1>`
        break
      }
      
      case "heading_2": {
        const textHtml = richTextToHtml(value.text || [])
        html += `<h2 style="margin-top: 3rem; margin-bottom: 1rem; font-size: 1.5rem; font-weight: bold;">${textHtml}</h2>`
        break
      }
      
      case "heading_3": {
        const textHtml = richTextToHtml(value.text || [])
        html += `<h3 style="margin-top: 3rem; margin-bottom: 1rem; font-size: 1.25rem; font-weight: bold;">${textHtml}</h3>`
        break
      }
      
      case "callout": {
        const textHtml = richTextToHtml(value?.text || [])
        const icon = value?.icon?.emoji || ""
        html += `<div style="display: flex; width: 100%; padding: 1rem; margin: 2rem 0; border-radius: 0.25rem; background-color: #dbeafe;">
          ${icon ? `<div style="margin-right: 1rem; font-size: 1.5rem;">${icon}</div>` : ""}
          <div style="flex: 1;">
            <div style="margin-left: 1rem;">${textHtml}</div>
            ${value?.children ? `<div style="padding: 1rem;">${blocksToHtml(value.children, baseUrl)}</div>` : ""}
          </div>
        </div>`
        break
      }
      
      case "bulleted_list_item": {
        const textHtml = richTextToHtml(value.text || [])
        html += `<li style="margin-bottom: 0.5rem;">${textHtml}</li>`
        break
      }
      
      case "numbered_list_item": {
        const textHtml = richTextToHtml(value.text || [])
        html += `<li style="margin-bottom: 0.5rem;">${textHtml}</li>`
        break
      }
      
      case "image": {
        const { source, caption } = getMediaProperties(value as FileWithCaption | ExternalFileWithCaption)
        const escapedSource = escapeUrl(source)
        const escapedCaption = caption ? escapeHtml(caption) : ""
        const captionHtml = caption ? `<figcaption style="margin-top: 0.75rem; color: #6b7280; font-size: 0.875rem; font-style: italic; text-align: center; line-height: 1.5;">${escapedCaption}</figcaption>` : ""
        html += `<figure style="margin: 2rem 0;">
          <img src="${escapedSource}" alt="${escapedCaption}" style="width: 100%; height: auto; border-radius: 0.5rem; display: block;" />
          ${captionHtml}
        </figure>`
        break
      }
      
      case "code": {
        const codeText = ((value?.text || []) as any[]).map((t: any) => t.plain_text || t.text?.content || "").join("")
        const language = value?.language || "plain text"
        const escapedCode = codeText
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;")
        html += `<pre style="background-color: #f3f4f6; padding: 1.25rem 1.5rem; border-radius: 0.5rem; overflow-x: auto; margin: 2rem 0; border: 1px solid #e5e7eb; line-height: 1.6; font-size: 0.875rem; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;"><code style="color: #1f2937; white-space: pre;">${escapedCode}</code></pre>`
        break
      }
      
      case "divider": {
        html += `<hr style="margin: 2rem 0; border: none; border-top: 1px solid #e5e7eb;" />`
        break
      }
      
      case "video": {
        const { source, caption } = getMediaProperties(value as FileWithCaption | ExternalFileWithCaption)
        const youtubeId = extractYoutubeId(source)
        const escapedCaption = caption ? escapeHtml(caption) : ""
        const captionHtml = caption ? `<figcaption style="margin-top: 0.75rem; color: #6b7280; font-size: 0.875rem; font-style: italic; text-align: center; line-height: 1.5;">${escapedCaption}</figcaption>` : ""
        
        if (youtubeId) {
          html += `<figure style="margin: 2rem 0;">
            <iframe src="https://youtube.com/embed/${escapeUrl(youtubeId)}" style="width: 100%; height: 550px; border-radius: 0.5rem; display: block;" frameborder="0" allowfullscreen></iframe>
            ${captionHtml}
          </figure>`
        } else {
          const escapedSource = escapeUrl(source)
          html += `<figure style="margin: 2rem 0;">
            <video src="${escapedSource}" controls style="width: 100%; border-radius: 0.5rem; display: block;"></video>
            ${captionHtml}
          </figure>`
        }
        break
      }
      
      case "embed": {
        const url = value.url || ""
        const escapedUrl = escapeUrl(url)
        if (url.includes("twitter.com")) {
          const regex = /status\/(\d+)/gm
          const matches = regex.exec(url)
          const tweetId = matches?.[1]
          if (tweetId) {
            html += `<div style="margin: 1.5rem 0;">
              <blockquote class="twitter-tweet"><a href="${escapedUrl}"></a></blockquote>
            </div>`
          }
        } else {
          html += `<div style="margin: 1.5rem 0;">
            <iframe src="${escapedUrl}" style="width: 100%; min-height: 400px; border: none;"></iframe>
          </div>`
        }
        break
      }
      
      case "column_list": {
        html += `<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; align-items: start; margin: 1rem 0;">
          ${value?.children ? value.children.map((col: any) => 
          `<div style="display: flex; flex-direction: column; gap: 1rem;">${blocksToHtml(col.column || [], baseUrl)}</div>`
        ).join("") : ""}
        </div>`
        break
      }
      
      case "column": {
        html += `<div style="display: flex; flex-direction: column; gap: 1rem;">
          ${value?.column ? blocksToHtml(value.column, baseUrl) : ""}
          ${value?.children ? blocksToHtml(value.children, baseUrl) : ""}
        </div>`
        break
      }
      
      case "table": {
        // Tables have children that are table_row blocks
        if (!value?.children || value.children.length === 0) {
          break
        }
        
        // Filter to only table_row blocks and extract their row data
        // Handle both minimized and full block structures
        const tableRows = value.children
          .filter((child: any) => child.type === "table_row")
          .map((child: any) => {
            // After minimization, the structure is child.table_row.cells
            // But we need to handle cases where it might be structured differently
            let cells: any[] = []
            
            if (child.table_row) {
              // Full or minimized structure with table_row property
              cells = child.table_row.cells || []
            } else if (child.cells) {
              // Direct cells property (shouldn't happen but handle it)
              cells = child.cells || []
            }
            
            // Ensure cells is an array
            if (!Array.isArray(cells)) {
              cells = []
            }
            
            return {
              id: child.id,
              cells: cells,
            }
          })
        
        if (tableRows.length === 0) {
          break
        }
        
        const hasColumnHeader = value?.has_column_header || false
        const columnHeaders = hasColumnHeader ? tableRows[0] : null
        const dataRows = hasColumnHeader ? tableRows.slice(1) : tableRows
        
        html += `<div style="overflow-x: auto; margin: 2rem 0;">
          <table style="width: 100%; min-width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
            ${columnHeaders ? `
              <thead style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                <tr>
                  ${(columnHeaders.cells || []).map((cell: any[]) => 
          `<th style="padding: 0.75rem 1rem; text-align: left; font-weight: 600; border: 1px solid #e5e7eb;">${richTextToHtmlForTableCell(cell)}</th>`
        ).join("")}
                </tr>
              </thead>
            ` : ""}
            <tbody>
              ${dataRows.map((rowData: any) => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  ${(rowData.cells || []).map((cell: any[]) => 
          `<td style="padding: 0.75rem 1rem; border: 1px solid #e5e7eb; color: #1f2937;">${richTextToHtmlForTableCell(cell)}</td>`
        ).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>`
        break
      }
      
      case "table_row": {
        // Table rows are handled within table blocks, but handle standalone if needed
        const cells = value?.cells || []
        html += `<tr>
          ${cells.map((cell: any[]) => 
          `<td style="padding: 0.75rem 1rem; border: 1px solid #e5e7eb;">${richTextToHtmlForTableCell(cell)}</td>`
        ).join("")}
        </tr>`
        break
      }
      
      default:
        // For unknown types, try to render text if available
        if (value?.text) {
          const textHtml = richTextToHtml(value.text)
          html += `<p>${textHtml}</p>`
        }
    }
  }
  
  return html
}

/**
 * Group list items into proper HTML lists
 */
function groupListBlocks(blocks: Block[]): (Block | { type: string; items: Block[] })[] {
  const updatedBlocks: Array<Block | { type: string; items: Block[] }> = []
  let currList: { type: string; items: Block[] } | null = null

  for (const b of blocks) {
    if (b.type === "bulleted_list_item" || b.type === "numbered_list_item") {
      if (currList == null) {
        currList = {
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
    updatedBlocks.push(currList)
  }

  return updatedBlocks
}

/**
 * Convert grouped blocks to HTML (handles lists properly)
 */
function groupedBlocksToHtml(groupedBlocks: (Block | { type: string; items: Block[] })[], baseUrl: string): string {
  let html = ""
  
  for (const block of groupedBlocks) {
    if ("items" in block) {
      // This is a grouped list
      const listType = block.type
      const itemsHtml = block.items.map((item: Block) => {
        const value = item[item.type as keyof Block] as any
        const textHtml = richTextToHtml(value.text || [])
        return `<li style="margin-bottom: 0.5rem;">${textHtml}</li>`
      }).join("")
      
      html += listType === "ul" 
        ? `<ul style="list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem;">${itemsHtml}</ul>`
        : `<ol style="list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem;">${itemsHtml}</ol>`
    } else {
      // Regular block
      html += blocksToHtml([block], baseUrl)
    }
  }
  
  return html
}

export const generateRssFeed = async (posts: PostProps[]) => {
  // Skip RSS generation in development to speed up page compilation
  if (process.env.NODE_ENV === 'development') {
    console.log('[RSS] Skipping RSS generation in development mode')
    return
  }

  const baseUrl = "https://blog.railway.com"
  const author = {
    name: "Railway",
    email: "contact@railway.com",
    link: "https://twitter.com/Railway",
  }

  const feed = new Feed({
    title: "Railway Blog",
    description:
      "A series of posts ranging from deployment tutorials to deep engineering adventures to how the team works and builds Railway.",
    id: baseUrl,
    link: baseUrl,
    language: "en",
    feedLinks: {
      rss2: `${baseUrl}/rss.xml`,
    },
    author,
    copyright: "Copyright © 2025 Railway Corp.",
  })

  const includedPosts = posts.filter((post) =>
    post.properties.Featured.checkbox ||
    post.properties.Category.select?.name?.toLowerCase() === "guide"
  )

  // Fetch all post content in parallel (with concurrency limit to avoid rate limits)
  const CONCURRENCY_LIMIT = 5
  const postContents = new Map<string, Block[]>()

  for (let i = 0; i < includedPosts.length; i += CONCURRENCY_LIMIT) {
    const batch = includedPosts.slice(i, i + CONCURRENCY_LIMIT)
    const results = await Promise.all(
      batch.map(async (post) => {
        try {
          const { blocks } = await mapDatabaseItemToPageProps(post.id)
          return { postId: post.id, blocks }
        } catch (error) {
          console.error(`Error fetching content for post ${post.id}:`, error)
          return { postId: post.id, blocks: null }
        }
      })
    )
    results.forEach(({ postId, blocks }) => {
      if (blocks) postContents.set(postId, blocks as Block[])
    })
  }

  // Process each post with pre-fetched content
  for (const post of includedPosts) {
    const url = baseUrl + "/p/" + post.properties.Slug.rich_text[0].plain_text
    const blocks = postContents.get(post.id)

    try {
      if (!blocks) {
        throw new Error('Content not fetched')
      }
      
      // Group list blocks for proper rendering
      const groupedBlocks = groupListBlocks(blocks as Block[])
      
      // Convert blocks to HTML
      const contentHtml = groupedBlocksToHtml(groupedBlocks, baseUrl)
      
      // Get featured image if available
      const featuredImage = post.properties.FeaturedImage?.url || post.properties.Image?.url
      
      // Get author names
      const authors = post.properties.Authors.people.filter(
        (author) => author != null && author.name != null
      )
      const authorNames = authors.map((a) => a.name).join(" & ")
      
      // Build full content with author, image, and content
      let fullContent = ""
      
      // Add author line at the beginning
      if (authorNames) {
        const escapedAuthorNames = authorNames
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;")
        const authorLabel = authors.length > 1 ? "Authors" : "Author"
        fullContent += `<p style="font-style: italic; margin-bottom: 1.5rem; color: #6b7280;">${authorLabel}: ${escapedAuthorNames}</p>`
      }
      
      if (featuredImage) {
        const escapedImageUrl = escapeUrl(featuredImage)
        const escapedTitle = escapeHtml(post.properties.Page.title[0].plain_text)
        fullContent += `<figure style="margin: 0 0 2rem 0;">
          <img src="${escapedImageUrl}" alt="${escapedTitle}" style="width: 100%; height: auto; border-radius: 0.5rem;" />
        </figure>`
      }
      
      // Add full content
      fullContent += contentHtml
      
      // Escape any remaining unescaped ampersands in URLs within the content
      fullContent = escapeAmpersandsInUrls(fullContent)
      
      // Escape title and description for XML
      const escapedTitle = escapeHtml(post.properties.Page.title[0].plain_text)
      const escapedDescription = escapeHtml(post.properties.Description.rich_text[0].plain_text)
      const escapedImageUrl = featuredImage ? escapeUrl(featuredImage) : undefined
      
      feed.addItem({
        title: escapedTitle,
        description: escapedDescription,
        content: fullContent,
        id: url,
        link: url,
        date: new Date(post.properties.Date.date.start),
        image: escapedImageUrl,
        category: [
          { name: "railway" },
          { name: "cloud" },
        ],
      })
    } catch (error) {
      console.error(`Error processing post ${post.id}:`, error)
      // Fallback to description-only if content fetch fails
      const escapedTitle = escapeHtml(post.properties.Page.title[0].plain_text)
      const escapedDescription = escapeHtml(post.properties.Description.rich_text[0].plain_text)
      
      feed.addItem({
        title: escapedTitle,
        description: escapedDescription,
        id: url,
        link: url,
        date: new Date(post.properties.Date.date.start),
        category: [
          { name: "railway" },
          { name: "cloud" },
        ],
      })
    }
  }

  writeFileSync(`public/rss.xml`, feed.rss2())
}
