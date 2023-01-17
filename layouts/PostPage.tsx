import { NotionText } from "@components/NotionText"
import Page from "@layouts/Page"
import { PostProps } from "@lib/types"
import dayjs from "dayjs"
import React, { useMemo } from "react"
import { BottomCTA } from "../components/BottomCTA"
import { ContinueReading } from "../components/ContinueReading"
import { Divider } from "../components/Divider"
import { useOgImage } from "../hooks/useOGImage"

export interface Props {
  post: PostProps
  relatedPosts: PostProps[]
  children?: React.ReactNode
}

export const PostPage: React.FC<Props> = ({ post, relatedPosts, children }) => {
  const formattedDate = useMemo(
    () => dayjs(post.properties.Date.date.start).format("MMM D, YYYY"),
    [post.properties.Date.date.start]
  )

  const author = post.properties.Authors.people[0]
  const ogImage = useOgImage({
    title: post.properties.Page.title[0].plain_text,
    authorName: author?.name,
  })

  const category = post.properties.Category?.select?.name

  return (
    <Page
      seo={{
        title: post.properties.Page.title[0].plain_text,
        description: post.properties.Description.rich_text[0].plain_text,
        image: ogImage,
        author: author?.name,
      }}
    >
      <div className="px-5 md:px-8 mx-auto">
        <article className="max-w-6xl mx-auto mt-24 mb-12 pb-32 border-b border-gray-100">
          <div className="flex items-center text-gray-500 space-x-3">
            <div className="flex items-center space-x-3">
              <img
                src={author?.avatar_url}
                alt={`Avatar of ${author?.name}`}
                className="w-6 h-6 rounded-full overflow-hidden"
              />
              <span>{author?.name}</span>
            </div>
            <Divider />
            <time dateTime={post.properties.Date.date.start}>
              {formattedDate}
            </time>
          </div>

          <header className="mt-5 mb-16 max-w-[736px]">
            <h1 className="text-huge font-bold">
              <NotionText text={post.properties.Page.title} />
            </h1>
          </header>

          <section className="max-w-[736px] ml-auto lg:mr-12 text-base sm:text-lg leading-8">
            {children}
          </section>
        </article>

        <div className="max-w-6xl mx-auto">
          {category != null && (
            <ContinueReading category={category} posts={relatedPosts} />
          )}

          <BottomCTA />
        </div>
      </div>
    </Page>
  )
}
