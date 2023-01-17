import dayjs from "dayjs"
import React, { useMemo } from "react"
import { PostProps } from "../lib/types"
import { cn } from "../utils"
import { Divider } from "./Divider"
import Link from "./Link"
import { NotionText } from "./NotionText"
import { PostCategory } from "./PostCategory"

export const ContinueReading: React.FC<{
  posts: PostProps[]
  category: string
}> = ({ posts, category }) => {
  category = category === "Guide" ? "Guides" : category

  return (
    <div>
      <header className={cn("flex items-center justify-between mb-8")}>
        <h3 className="text-gray-500 font-semibold text-lg">
          Continue Reading...
        </h3>
        <Link
          className={cn("text-pink-500", "hover:underline")}
          href={`/${category.toLowerCase()}`}
        >
          View All {category} →
        </Link>
      </header>

      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-8")}>
        {posts.map((post) => (
          <RelatedPostItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}

const RelatedPostItem: React.FC<{ post: PostProps }> = ({ post }) => {
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
      className="flex flex-col bg-secondaryBg p-6 rounded-lg hover:bg-gray-100 group"
    >
      {category != null && <PostCategory category={category} />}

      <div className="flex-grow">
        <header className="font-bold text-lg mt-2 mb-1">
          <NotionText text={post.properties.Page.title} noLinks />
        </header>

        <p className="text-base text-gray-800 line-clamp-2">
          <NotionText text={post.properties.Description.rich_text} noLinks />
        </p>
      </div>

      <div className="flex items-center gap-3 mt-6">
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
