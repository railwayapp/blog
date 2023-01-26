import Link from "@components/Link"
import { PostProps } from "@lib/types"
import dayjs from "dayjs"
import React, { useMemo } from "react"
import { Divider } from "./Divider"
import { NotionText } from "./NotionText"
import { PostCategory } from "./PostCategory"

export interface Props {
  post: PostProps
}

const PostItem: React.FC<Props> = ({ post }) => {
  const formattedDate = useMemo(
    () =>
      dayjs(new Date(post.properties.Date.date.start)).format("MMM D, YYYY"),
    [post.properties.Date.date.start]
  )

  const author = post.properties.Authors.people[0]
  const category = post.properties.Category.select?.name

  return (
    <Link
      href={`/p/${post.properties.Slug.rich_text[0].plain_text}`}
      className="flex flex-col border-b border-gray-100 group"
    >
      {category != null && <PostCategory category={category} />}

      <div className="flex-grow">
        <h4 className="font-bold text-lg mt-2 mb-1 group-hover:opacity-60 tracking-tight">
          <NotionText text={post.properties.Page.title} noLinks />
        </h4>

        <p className="text-base text-gray-800 line-clamp-2">
          <NotionText text={post.properties.Description.rich_text} noLinks />
        </p>
      </div>

      <div className="flex items-center gap-3 mt-6 mb-10">
        <img
          src={author.avatar_url}
          alt={`Avatar of ${author.name}`}
          className="w-6 h-6 rounded-full overflow-hidden"
        />
        <span className="font-medium text-sm text-gray-500">{author.name}</span>
        <Divider />
        <span className="font-medium text-sm text-gray-500">
          {formattedDate}
        </span>
      </div>
    </Link>
  )
}

export default PostItem
