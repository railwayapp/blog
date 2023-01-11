import React from "react"
import { PostProps } from "../lib/types"
import { Categories } from "./Categories"
import PostItem from "./PostItem"

export const PostList: React.FC<{ posts: PostProps[] }> = ({ posts }) => {
  return (
    <>
      <div className="max-w-6xl px-5 md:px-8 mx-auto">
        <Categories />

        {posts.length === 0 ? (
          <div className="text-center text-gray-500">Pretty empty here</div>
        ) : (
          <div className="posts max-w-5xl">
            {posts
              .filter((p) => p.properties.Published.checkbox)
              .map((p) => (
                <PostItem key={p.id} post={p} />
              ))}
          </div>
        )}
      </div>

      <img
        src="/grid.svg"
        className="absolute top-24 left-0 transform scale-x-[-1] max-w-none opacity-40 pointer-events-none"
      />
      <img
        src="/grid.svg"
        className="hidden lg:block absolute top-24 right-0 max-w-none opacity-40 pointer-events-none"
      />
    </>
  )
}
