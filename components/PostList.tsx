import React from "react"
import { PostProps } from "../lib/types"
import { Categories } from "./Categories"
import PostItem from "./PostItem"

export const PostList: React.FC<{ posts: PostProps[] }> = ({ posts }) => {
  return (
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
  )
}
