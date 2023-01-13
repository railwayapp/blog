import React from "react"
import { PostProps } from "../lib/types"
import { Categories } from "./Categories"
import { FeaturedPostItem } from "./FeaturedPostItem"
import PostItem from "./PostItem"

export const PostList: React.FC<{ posts: PostProps[] }> = ({ posts }) => {
  const featuredPosts = posts.filter((p) => p.properties.Featured.checkbox)
  const otherPosts = posts.filter((p) => !p.properties.Featured.checkbox)

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
            <h2 className="text-3xl font-bold mb-12">Everything</h2>

            <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
              {otherPosts
                .filter((p) => p.properties.Published.checkbox)
                .map((p) => (
                  <PostItem key={p.id} post={p} />
                ))}
            </div>
          </div>
        )}

        {/* <img
        src="/grid.svg"
        className="absolute top-24 left-0 transform scale-x-[-1] max-w-none opacity-40 pointer-events-none"
      />
      <img
        src="/grid.svg"
        className="hidden lg:block absolute top-24 right-0 max-w-none opacity-40 pointer-events-none"
      /> */}
      </div>
    </>
  )
}
