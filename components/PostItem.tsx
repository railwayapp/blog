import { useMemo } from "react"
import Image from "next/image"
import dayjs from "dayjs"

import { Post } from "@lib/types"

import Link from "@components/Link"
import { textBlock } from "@lib/notion/renderers"

export interface Props {
  post: Post
}

const PostItem = ({ post }: Props) => {
  const formattedDate = useMemo(
    () => dayjs(new Date(post.Date)).format("MMM D, YYYY"),
    [post.Date]
  )

  return (
    <Link
      href={`/p/${post.Slug}`}
      className="flex flex-col md:flex-row md:items-center mb-16 space-y-5 md:space-y-0"
    >
      <div className="transform lg:hover:scale-105 transition-transform flex-1">
        <Image
          className="rounded-lg bg-gray-100 hover:scale-50"
          src={post.Image}
          width={1440}
          height={720}
        />
      </div>

      <div className="md:ml-20 flex flex-col justify-center flex-1">
        <header className="font-bold text-4xl leading-tight">
          {post.Page}
        </header>
        <p className="text-gray-400 mt-3 line-clamp-3 leading-relaxed">
          {(!post.preview || post.preview.length === 0) &&
            "No preview available"}
          {(post.preview || []).map((block, idx) =>
            textBlock(block, true, `${post.Slug}${idx}`)
          )}
        </p>
        <p className="text-gray-600 mt-3">{formattedDate}</p>
      </div>
    </Link>
  )
}

export default PostItem
