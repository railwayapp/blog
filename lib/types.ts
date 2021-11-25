import {
  CheckboxPropertyValue,
  DatePropertyValue,
  Page,
  PersonUser,
  RichTextPropertyValue,
  TitlePropertyValue,
  URLPropertyValue,
} from "@notionhq/client/build/src/api-types"

export interface PostItem {
  Page: TitlePropertyValue
  Slug: RichTextPropertyValue
  Published: CheckboxPropertyValue
  Date: DatePropertyValue
  Authors: { people: PersonUser[] }
  Image: URLPropertyValue
  Description: RichTextPropertyValue
}

export interface PostProps extends Omit<Page, "properties"> {
  properties: PostItem
}
