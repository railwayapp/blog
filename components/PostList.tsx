import { getCategoryLabel } from "@lib/cms"
import React, { useState } from "react"
import { BlogCategory, BlogPost } from "../lib/types"
import { Categories } from "./Categories"
import { CustomerStories } from "./CustomerStories"
import { FeaturedPostItem } from "./FeaturedPostItem"
import PostItem from "./PostItem"
import { ScalingRailway } from "./ScalingRailway"

const DEFAULT_POSTS_LENGTH = 8

export const PostList: React.FC<{
  posts: BlogPost[]
  categories: BlogCategory[]
  category?: BlogCategory | string
  showScalingRailway?: boolean
  showCustomerStories?: boolean
}> = ({
  posts,
  categories,
  category,
  showScalingRailway,
  showCustomerStories,
}) => {
  const featuredPosts = posts.filter((post) => post.featured)

  const otherPosts =
    category == null
      ? posts.filter((post) => !post.featured && !post.externalAuthor)
      : posts.filter((post) => !post.featured)

  const [showMore, setShowMore] = useState(false)
  const hasMorePosts = otherPosts.length > DEFAULT_POSTS_LENGTH

  return (
    <>
      <div className="px-5 md:px-8">
        <div className="max-w-6xl mx-auto mb-24">
          <Categories categories={categories} />
          <hr className="border-gray-100 mb-12" />

          {featuredPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 md:gap-y-12">
              {featuredPosts.map((post) => (
                <FeaturedPostItem key={post.id} post={post} />
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
              {category == null ? "Everything" : getCategoryLabel(category)}
            </h2>

            <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 [&>*:nth-last-child(2)]:border-transparent md:[&>*:nth-last-child(3)]:border-transparent">
              {otherPosts
                .slice(0, showMore ? undefined : DEFAULT_POSTS_LENGTH)
                .map((post) => (
                  <PostItem key={post.id} post={post} />
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
