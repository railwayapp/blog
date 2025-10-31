import {
  CheckboxPropertyValue,
  DatePropertyValue,
  Page,
  PersonUser,
  RichTextPropertyValue,
  TitlePropertyValue,
  URLPropertyValue,
  SelectPropertyValue,
  Block,
} from "@notionhq/client/build/src/api-types"

export interface PostItem {
  Page: TitlePropertyValue
  Slug: RichTextPropertyValue
  Published: CheckboxPropertyValue
  Featured: CheckboxPropertyValue
  Date: DatePropertyValue
  Authors: { people: PersonUser[] }
  Image: URLPropertyValue
  FeaturedImage: URLPropertyValue
  Description: RichTextPropertyValue
  Category: SelectPropertyValue
  Community: CheckboxPropertyValue
}

export interface PostProps extends Omit<Page, "properties"> {
  properties: PostItem
}

export interface ListBlock {
  id: string
  type: string
  items: Block[]
}

// Minimal type for related posts - only includes what's needed for display
export interface MinimalRelatedPost {
  id: string
  properties: {
    Page: { title: Array<{ 
      plain_text: string
      type?: string
      annotations?: {
        bold?: boolean
        italic?: boolean
        strikethrough?: boolean
        underline?: boolean
        code?: boolean
        color?: string
      }
      text?: {
        content: string
        link?: { url: string }
      }
      href?: string
    }> }
    Slug: { rich_text: Array<{ 
      plain_text: string
      type?: string
      annotations?: {
        bold?: boolean
        italic?: boolean
        strikethrough?: boolean
        underline?: boolean
        code?: boolean
        color?: string
      }
      text?: {
        content: string
        link?: { url: string }
      }
      href?: string
    }> }
    Description: { rich_text: Array<{ 
      plain_text: string
      type?: string
      annotations?: {
        bold?: boolean
        italic?: boolean
        strikethrough?: boolean
        underline?: boolean
        code?: boolean
        color?: string
      }
      text?: {
        content: string
        link?: { url: string }
      }
      href?: string
    }> }
    Date: { date: { start: string } }
    Authors: { people: Array<{ name: string; avatar_url: string | null }> }
    Category: { select: { name?: string } | null }
    Community: { checkbox: boolean }
  }
}
