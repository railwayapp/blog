/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Block } from "@notionhq/client/build/src/api-types"

import { getMediaProperties } from "@lib/notion"

import { NotionText } from "@components/NotionText"
import { NotionImage } from "@components/NotionImage"
import { NotionHeading } from "@components/NotionHeading"
import Code from "@components/Code"

interface Props {
  block: Block
}
export const RenderBlock: React.FC<Props> = ({ block }) => {
  const { type } = block
  const value = block[type]

  /**
   * I don't like this but if we do multiple line breaks (enter key) in Notion,
   * the API returns them as empty arrays and they go in the UI as a paragraph
   * with no content but margin bottom of 32px
   *
   * The check below filters such items
   */
  if (value.text != null && value.text.length === 0) {
    return null
  }
  switch (type) {
    case "paragraph": {
      return (
        <p className="leading-extra-relaxed mb-8">
          <NotionText text={value.text} />
        </p>
      )
    }
    case "heading_1":
    case "heading_2":
    case "heading_3": {
      return <NotionHeading type={type} text={value.text} />
    }
    // @ts-ignore: Current client version does not support `callout` but API does
    case "callout": {
      return (
        <div className="flex w-full p-4 rounded border border-transparent bg-gray-50">
          {value.icon.emoji && (
            <div className="text-yellow-500">{value.icon.emoji}</div>
          )}
          <div className="ml-4 text-black">
            <NotionText text={value.text} />
          </div>
        </div>
      )
    }
    case "bulleted_list_item":
    case "numbered_list_item": {
      return (
        <li>
          <NotionText text={value.text} />
        </li>
      )
    }
    case "image": {
      const { source, caption } = getMediaProperties(value)
      return (
        <div className="flex flex-col my-8 space-y-2">
          <NotionImage src={source} alt={caption} />
          {caption && <p className="text-gray-500 text-sm">{caption}</p>}
        </div>
      )
    }
    // @ts-ignore: Current client version does not support `code` but API does
    case "code": {
      return <Code language={value.language}>{value.text[0].plain_text}</Code>
    }
    // @ts-ignore: Current client version does not support `divider` but API does
    case "divider": {
      return <hr />
    }
    case "video": {
      const { source, caption } = getMediaProperties(value)
      return (
        <div className="flex flex-col my-8 space-y-2">
          <video
            src={source}
            controls
            autoPlay
            loop
            muted
            className="rounded-lg"
          />
          {caption && <p className="text-gray-500 text-sm">{caption}</p>}
        </div>
      )
    }
    default: {
      return (
        <p>
          ❌ Unsupported block{" "}
          {type === "unsupported" ? "unsupported by Notion API" : type})
        </p>
      )
    }
  }
}
