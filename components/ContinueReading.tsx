import { getCategoryLabel, getCategoryPath } from "@lib/cms"
import { BlogCategory, BlogPost } from "@lib/types"
import dayjs from "dayjs"
import React, { useMemo } from "react"
import { cn } from "../utils"
import { Divider } from "./Divider"
import Link from "./Link"
import { PostCategory } from "./PostCategory"

export const ContinueReading: React.FC<{
  posts: BlogPost[]
  category: BlogCategory
}> = ({ posts, category }) => {
  const displayCategory = getCategoryLabel(category)

  return (
    <div>
      <header className={cn("flex items-center justify-between mb-8")}>
        <h3 className="text-gray-500 font-semibold text-lg">
          Continue Reading...
        </h3>
        <Link
          className={cn("text-pink-500", "hover:underline")}
          href={getCategoryPath(category)}
        >
          View All {displayCategory} -&gt;
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

const RelatedPostItem: React.FC<{ post: BlogPost }> = ({ post }) => {
  const formattedDate = useMemo(
    () => dayjs(post.publishedAt).format("MMM D, YYYY"),
    [post.publishedAt]
  )
  const authorsWithAvatars = post.authors.filter((author) => author.avatarUrl)

  return (
    <Link
      href={`/p/${post.slug}`}
      className="flex flex-col bg-secondaryBg p-6 rounded-lg hover:bg-gray-100 group"
    >
      {post.category != null && (
        <PostCategory
          category={post.category.title}
          isCommunity={post.externalAuthor}
        />
      )}

      <div className="flex-grow">
        <header className="font-medium font-serif text-lg mt-2 mb-1">
          {post.title}
        </header>

        <p className="text-base text-gray-800 line-clamp-2">
          {post.description}
        </p>
      </div>

      <div className="flex items-center gap-3 mt-6">
        {post.authors.length > 0 && (
          <>
            {authorsWithAvatars.length > 0 && (
              <div className="flex items-center">
                {authorsWithAvatars.map((author, index) => (
                  <img
                    key={author.id}
                    src={author.avatarUrl}
                    alt={`Avatar of ${author.name}`}
                    className="w-6 h-6 rounded-full overflow-hidden border-2 border-white"
                    style={{ marginLeft: index > 0 ? "-8px" : 0 }}
                    loading="lazy"
                    decoding="async"
                    width={24}
                    height={24}
                  />
                ))}
              </div>
            )}
            <span className="font-medium text-sm text-gray-500">
              {post.authors.map((author) => author.name).join(" & ")}
            </span>
            <Divider />
          </>
        )}
        <span className="font-medium text-sm text-gray-500">
          {formattedDate}
        </span>
      </div>
    </Link>
  )
}
