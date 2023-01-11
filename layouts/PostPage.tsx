import { NotionText } from "@components/NotionText"
import Page from "@layouts/Page"
import { PostProps } from "@lib/types"
import dayjs from "dayjs"
import React, { useMemo } from "react"
import { Background } from "../components/Background"
import { useOgImage } from "../hooks/useOGImage"

export interface Props {
  post: PostProps
}

export const PostPage: React.FC<Props> = ({ post, children }) => {
  const formattedDate = useMemo(
    () => dayjs(post.properties.Date.date.start).format("MMM D, YYYY"),
    [post.properties.Date.date.start]
  )

  const author = post.properties.Authors.people[0]
  const ogImage = useOgImage({
    title: post.properties.Page.title[0].plain_text,
    authorName: author?.name,
  })

  return (
    <Page
      seo={{
        title: post.properties.Page.title[0].plain_text,
        description: post.properties.Description.rich_text[0].plain_text,
        image: ogImage,
        author: author?.name,
      }}
    >
      <div className="wrapper px-5 md:px-8">
        <div className="mb-48">
          <article>
            <header className="mt-12 mb-12 sm:mt-24 sm:mb-16">
              <h1 className="text-jumbo font-bold">
                <NotionText text={post.properties.Page.title} />
              </h1>

              <div className="flex items-center pt-8 text-gray-500 space-x-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={author?.avatar_url}
                    alt={`Avatar of ${author?.name}`}
                    className="w-6 h-6 rounded-full overflow-hidden"
                  />
                  <span>{author?.name}</span>
                </div>
                <span>{"·"}</span>
                <time dateTime={post.properties.Date.date.start}>
                  {formattedDate}
                </time>
              </div>
            </header>

            <section className="post text-base sm:text-lg leading-8">
              {children}
            </section>
          </article>
        </div>
      </div>

      <Background />
    </Page>
  )
}
