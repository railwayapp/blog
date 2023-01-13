import React, { useState } from "react"
import { PostProps } from "../lib/types"
import { Categories } from "./Categories"
import { FeaturedPostItem } from "./FeaturedPostItem"
import PostItem from "./PostItem"

const DEFAULT_POSTS_LENGTH = 12

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const PostList: React.FC<{ posts: PostProps[]; category?: string }> = ({
  posts,
  category,
}) => {
  const featuredPosts = posts.filter((p) => p.properties.Featured.checkbox)
  const otherPosts = posts.filter((p) => !p.properties.Featured.checkbox)

  const [showMore, setShowMore] = useState(false)

  return (
    <>
      <div className="max-w-6xl px-5 md:px-8 mx-auto">
        <Categories />
        <hr className="border-gray-100 mb-12" />

        {featuredPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 md:gap-y-12">
            {featuredPosts.map((p) => (
              <FeaturedPostItem key={p.id} post={p} />
            ))}
          </div>
        )}

        {featuredPosts.length > 0 && otherPosts.length > 0 && (
          <hr className="border-gray-100 my-24" />
        )}

        {otherPosts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 mb-24">
            <h2 className="text-3xl font-bold mb-12">
              {capitalize(category ?? "Everything")}
            </h2>

            <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 [&>*:nth-last-child(2)]:border-transparent md:[&>*:nth-last-child(3)]:border-transparent">
              {otherPosts
                .filter((p) => p.properties.Published.checkbox)
                .slice(0, showMore ? undefined : DEFAULT_POSTS_LENGTH)
                .map((p) => (
                  <PostItem key={p.id} post={p} />
                ))}

              {showMore ? (
                <div />
              ) : (
                <button
                  className="col-span-2 w-full text-center text-pink-700 border border-pink-200 rounded-md px-4 py-2 hover:text-pink-800 hover:border-pink-500 transition-colors duration-100"
                  onClick={() => setShowMore(true)}
                >
                  Load more posts...
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
