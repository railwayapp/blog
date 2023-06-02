import React, { useMemo } from "react"
import { ListBlock } from "../lib/types"
import { NotionList } from "./NotionText"
import { RenderBlock } from "./RenderBlock"
import { Block } from "@notionhq/client/build/src/api-types"

export const NotionListBlock: React.FC<{
  block: ListBlock
  className?: string
}> = ({ block, className }) => {
  return (
    <NotionList type={block.type} className={className}>
      {block.items.map((item) => (
        <RenderListItem key={item.id} item={item} />
      ))}
    </NotionList>
  )
}

const RenderListItem: React.FC<{ item: Block }> = ({ item }) => {
  const children = useMemo(() => {
    return ((item as any).bulleted_list_item?.children ?? []) as Block[]
  }, [item])

  const subListBlock: ListBlock | null = useMemo(() => {
    if (children.length === 0) return null
    return {
      id: children[0].id,
      items: children,
      type: "ul",
    }
  }, [children])

  return (
    <>
      <RenderBlock block={item} />

      {subListBlock != null && (
        <NotionListBlock block={subListBlock} className="mt-4 mb-4" />
      )}
    </>
  )
}
