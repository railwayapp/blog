import React, { useState } from "react"
import { PostProps } from "../lib/types"
import { Categories } from "./Categories"
import { CustomerStories } from "./CustomerStories"
import { FeaturedPostItem } from "./FeaturedPostItem"
import PostItem from "./PostItem"
import { ScalingRailway } from "./ScalingRailway"

const DEFAULT_POSTS_LENGTH = 8

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const PostList: React.FC<{
  posts: PostProps[]
  category?: string
  showScalingRailway?: boolean
  showCustomerStories?: boolean
}> = ({ posts, category, showScalingRailway, showCustomerStories }) => {
  const featuredPosts = posts.filter((p) => p.properties.Featured.checkbox)
  const otherPosts = posts.filter((p) => !p.properties.Featured.checkbox)

  const [showMore, setShowMore] = useState(false)
  const hasMorePosts = otherPosts.length > DEFAULT_POSTS_LENGTH

  return (
    <>
      <div className="px-5 md:px-8">
        <div className="max-w-6xl mx-auto mb-24">
          <Categories />
          <hr className="border-gray-100 mb-12" />

          {featuredPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 md:gap-y-12">
              {featuredPosts.map((p) => (
                <FeaturedPostItem key={p.id} post={p} />
              ))}
            </div>
          )}
        </div>

        {showScalingRailway && <ScalingRailway />}
        {showCustomerStories && <CustomerStories />}

        {featuredPosts.length > 0 && otherPosts.length > 0 && (
          <hr className="max-w-6xl mx-auto border-gray-100" />
        )}

        {otherPosts.length > 0 && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 mb-24 mt-24">
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

              {showMore || !hasMorePosts ? (
                <div />
              ) : (
                <button
                  className="md:col-span-2 w-full text-center text-pink-700 border border-pink-200 rounded-md px-4 py-2 hover:text-pink-800 hover:border-pink-500 transition-colors duration-100"
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
