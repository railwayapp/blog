import React, { useMemo } from "react"
import Image from "next/image"
import dayjs from "dayjs"

import { PostProps } from "@lib/types"

import Link from "@components/Link"
import { NotionText } from "./NotionText"
import { useOgImage } from "../hooks/useOGImage"

export interface Props {
  post: PostProps
}

const PostItem: React.FC<Props> = ({ post }) => {
  const formattedDate = useMemo(
    () =>
      dayjs(new Date(post.properties.Date.date.start)).format("MMM D, YYYY"),
    [post.properties.Date.date.start]
  )

  const image = useOgImage({
    title: post.properties.Page.title[0].plain_text ?? "",
    authorName: post.properties.Authors.people[0].name ?? "",
  })

  return (
    <Link
      href={`/p/${post.properties.Slug.rich_text[0].plain_text}`}
      className="flex flex-col md:flex-row md:items-center mb-16 space-y-5 md:space-y-0"
    >
      <div className="transform lg:hover:scale-105 transition-transform flex-1 border border-gray-200 rounded-lg overflow-hidden">
        <Image src={image} width={1440} height={720} />
      </div>

      <div className="md:ml-20 flex flex-col justify-center flex-1">
        <header className="font-bold text-4xl leading-normal">
          <NotionText text={post.properties.Page.title} />
        </header>
        <p className="text-gray-600 mt-3 line-clamp-3 leading-8">
          <NotionText text={post.properties.Description.rich_text} />
        </p>
        <p className="text-gray-400 mt-3">{formattedDate}</p>
      </div>
    </Link>
  )
}

export default PostItem
