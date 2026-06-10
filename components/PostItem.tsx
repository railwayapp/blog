import Link from "@components/Link"
import { BlogPost } from "@lib/types"
import React, { useMemo } from "react"
import { formatPostDate } from "../utils"
import { Divider } from "./Divider"
import { PostCategory } from "./PostCategory"

export interface Props {
  post: BlogPost
}

const PostItem: React.FC<Props> = ({ post }) => {
  const formattedDate = useMemo(
    () => formatPostDate(post.publishedAt),
    [post.publishedAt]
  )
  const authorsWithAvatars = post.authors.filter((author) => author.avatarUrl)

  return (
    <Link href={`/p/${post.slug}`} className="flex flex-col border-b border-gray-100 group">
      {post.category != null && (
        <PostCategory
          category={post.category.title}
          isCommunity={post.externalAuthor}
        />
      )}

      <div className="flex-grow">
        <h4 className="font-medium font-serif text-lg mt-2 mb-1 group-hover:opacity-60 tracking-tight">
          {post.title}
        </h4>

        <p className="text-base text-gray-800 line-clamp-2">
          {post.description}
        </p>
      </div>

      <div className="flex items-center gap-3 mt-6 mb-10">
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

export default PostItem
