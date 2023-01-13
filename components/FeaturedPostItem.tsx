import Link from "@components/Link"
import { PostProps } from "@lib/types"
import dayjs from "dayjs"
import React, { useMemo } from "react"
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
      className=""
    >
      {featuredImage != null ? (
        <img src={featuredImage} />
      ) : (
        <div className="h-[240px] w-full bg-gray-100 rounded-xl" />
      )}

      <div className="mt-6">
        {category != null && <PostCategory category={category} />}
      </div>

      <header className="font-bold text-2xl my-4">
        <NotionText text={post.properties.Page.title} />
      </header>

      <p className="text-lg text-gray-800 line-clamp-2">
        <NotionText text={post.properties.Description.rich_text} />
      </p>

      <div className="flex items-center gap-3 mt-6">
        <img
          src={author.avatar_url}
          alt={`Avatar of ${author.name}`}
          className="w-6 h-6 rounded-full overflow-hidden"
        />
        <span className="font-medium text-sm text-gray-500">{author.name}</span>
      </div>

      {/* <div className="hidden md:flex pt-8 text-sm text-gray-500 items-start">
        {formattedDate}
      </div>

      <div className="md:col-span-2 py-8 flex flex-col justify-center flex-1">
        {category != null && <PostCategory category={category} />}

        <header className="font-bold text-2xl leading-normal group-hover:opacity-60 sm:group-hover:opacity-100">
          <NotionText text={post.properties.Page.title} />
        </header>

        <p className="text-gray-800 mt-2 line-clamp-3 leading-8 max-w-lg">
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
      </div> */}
    </Link>
  )
}
