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

  // Category pages have no other h1; the homepage's h1 lives elsewhere.
  const ListHeading = category == null ? "h2" : "h1"

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

        {/* Category pages always render the heading — it is their only h1 —
            even when every post is featured and the card list is empty
            (e.g. a new category whose posts are all featured). */}
        {(otherPosts.length > 0 || category != null) && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 mb-24 mt-24">
            <ListHeading className="text-3xl font-bold mb-12">
              {category == null ? "Everything" : getCategoryLabel(category)}
            </ListHeading>

            {otherPosts.length > 0 && (
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
            )}

            {/* Crawlable links for the posts hidden behind "Load more" so
                every post is reachable in the server-rendered HTML. Plain
                <a> (never visible or clickable); unmounts once the full
                cards render. Kept outside the cards grid so its
                nth-last-child border CSS keeps counting correctly. */}
            {!showMore && hasMorePosts && (
              <ul className="hidden">
                {otherPosts.slice(DEFAULT_POSTS_LENGTH).map((post) => (
                  <li key={post.id}>
                    <a href={`/p/${post.slug}`}>{post.title}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  )
}
