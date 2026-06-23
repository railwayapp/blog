import Link from "@components/Link"
import { buildCMSImageSrcSet, buildCMSImageURL } from "@lib/cms/image"
import { BlogPost } from "@lib/types"
import React, { useMemo } from "react"
import { formatPostDate } from "../utils"
import { Divider } from "./Divider"
import { PostCategory } from "./PostCategory"

export const FeaturedPostItem: React.FC<{ post: BlogPost }> = ({ post }) => {
  const formattedDate = useMemo(
    () => formatPostDate(post.publishedAt),
    [post.publishedAt]
  )
  const authorsWithAvatars = post.authors.filter((author) => author.avatarUrl)
  const featuredImage = post.featuredImage

  return (
    <Link href={`/p/${post.slug}`} className="group">
      {featuredImage != null ? (
        <div className="w-full aspect-[2.25/1] relative border border-black border-opacity-10 rounded-xl overflow-hidden">
          <img
            src={buildCMSImageURL(featuredImage.url, {
              format: "webp",
              width: 1200,
            })}
            srcSet={buildCMSImageSrcSet(featuredImage.url, {
              format: "webp",
              maxWidth: 1200,
            })}
            sizes="(max-width: 768px) 100vw, 560px"
            alt={featuredImage.alt || post.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-[1.05]"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      ) : (
        <div className="w-full aspect-[2/1] bg-gray-100 rounded-xl" />
      )}

      <div className="mt-6">
        {post.category != null && (
          <PostCategory
            category={post.category.title}
            isCommunity={post.externalAuthor}
          />
        )}

        <h3 className="font-medium font-serif text-2xl my-4 group-hover:opacity-60 tracking-tight">
          {post.title}
        </h3>

        <p className="text-lg text-gray-800 line-clamp-2">
          {post.description}
        </p>

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
      </div>
    </Link>
  )
}
