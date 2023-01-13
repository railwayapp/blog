import Link from "@components/Link"
import { PostProps } from "@lib/types"
import dayjs from "dayjs"
import Image from "next/image"
import React, { useMemo } from "react"
import { Divider } from "./Divider"
import { NotionText } from "./NotionText"
import { PostCategory } from "./PostCategory"

export const FeaturedPostItem: React.FC<{ post: PostProps }> = ({ post }) => {
  const formattedDate = useMemo(
    () =>
      dayjs(new Date(post.properties.Date.date.start)).format("MMM D, YYYY"),
    [post.properties.Date.date.start]
  )

  const author = post.properties.Authors.people[0]
  const category = post.properties.Category.select?.name
  const featuredImage = post.properties.FeaturedImage.url

  return (
    <Link
      href={`/p/${post.properties.Slug.rich_text[0].plain_text}`}
      className="group"
    >
      {featuredImage != null ? (
        <div className="w-full h-[240px] relative border border-black border-opacity-10 rounded-xl overflow-hidden">
          <Image
            src={featuredImage}
            fill
            alt=""
            className="transition-transform group-hover:scale-[1.05]"
          />
        </div>
      ) : (
        <div className="h-[240px] w-full bg-gray-100 rounded-xl" />
      )}

      <div className="mt-6">
        {category != null && <PostCategory category={category} />}

        <header className="font-bold text-2xl my-4 group-hover:opacity-60">
          <NotionText text={post.properties.Page.title} noLinks />
        </header>

        <p className="text-lg text-gray-800 line-clamp-2">
          <NotionText text={post.properties.Description.rich_text} noLinks />
        </p>

        <div className="flex items-center gap-3 mt-6">
          <img
            src={author.avatar_url}
            alt={`Avatar of ${author.name}`}
            className="w-6 h-6 rounded-full overflow-hidden"
          />
          <span className="font-medium text-sm text-gray-500">
            {author.name}
          </span>
          <Divider />
          <span className="font-medium text-sm text-gray-500">
            {formattedDate}
          </span>
        </div>
      </div>
    </Link>
  )
}
