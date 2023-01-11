import dayjs from "dayjs"
import React, { useMemo } from "react"

import { PostProps } from "@lib/types"

import Link from "@components/Link"
import { NotionText } from "./NotionText"

export interface Props {
  post: PostProps
}

const categoryToColor = {
  News: "text-blue-500",
  Guide: "text-purple-500",
  Company: "text-green-500",
  Engineering: "text-pink-500",
}

const PostItem: React.FC<Props> = ({ post }) => {
  const formattedDate = useMemo(
    () =>
      dayjs(new Date(post.properties.Date.date.start)).format("MMM D, YYYY"),
    [post.properties.Date.date.start]
  )

  // const image = useOgImage({
  //   title: post.properties.Page.title[0].plain_text ?? "",
  //   authorName: post.properties.Authors.people[0].name ?? "",
  // })

  const author = post.properties.Authors.people[0]
  const category = post.properties.Category.select?.name

  return (
    <Link
      href={`/p/${post.properties.Slug.rich_text[0].plain_text}`}
      className="relative grid grid-cols-1 md:grid-cols-3 gap-12 mb-4 md:mb-16 overflow-hidden group"
    >
      <div className="hidden md:flex pt-10 text-sm text-gray-500 items-start">
        {formattedDate}
      </div>

      <div className="md:col-span-2 py-8 flex flex-col justify-center flex-1">
        {category != null && (
          <p
            className={`mb-3 font-semibold ${
              categoryToColor[category] ?? "text-gray-500"
            }`}
          >
            {category}
          </p>
        )}

        <header className="font-bold text-2xl leading-normal">
          <NotionText text={post.properties.Page.title} />
        </header>

        <p className="text-gray-800 mt-3 line-clamp-3 leading-8">
          <NotionText text={post.properties.Description.rich_text} />
        </p>

        <div className="mt-6 flex gap-8 items-center">
          <div className="flex items-center space-x-3">
            <img
              src={author.avatar_url}
              alt={`Avatar of ${author.name}`}
              className="w-6 h-6 rounded-full overflow-hidden"
            />
            <span className="font-medium text-sm">{author.name}</span>
          </div>

          <div className="block md:hidden text-sm font-medium text-gray-500">
            {formattedDate}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default PostItem
