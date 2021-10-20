import {
  RichTextPropertyValue,
  CheckboxPropertyValue,
  DatePropertyValue,
  TitlePropertyValue,
  PersonUser,
  Page,
  URLPropertyValue,
} from "@notionhq/client/build/src/api-types"

export interface PostItem {
  Page: TitlePropertyValue
  Slug: RichTextPropertyValue
  Published: CheckboxPropertyValue
  Date: DatePropertyValue
  Authors: PersonUser
  Image: URLPropertyValue
  Description: RichTextPropertyValue
}

export interface PostProps extends Omit<Page, "properties"> {
  properties: PostItem
}
