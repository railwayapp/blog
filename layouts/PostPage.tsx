import { NotionText } from "@components/NotionText"
import Page from "@layouts/Page"
import { PostProps } from "@lib/types"
import dayjs from "dayjs"
import React, { useMemo } from "react"

export interface Props {
  post: PostProps
}

export const PostPage: React.FC<Props> = ({ post, children }) => {
  const formattedDate = useMemo(
    () => dayjs(post.properties.Date.date.start).format("MMM D, YYYY"),
    [post.properties.Date.date.start]
  )

  return (
    <Page
      seo={{
        title: post.properties.Page.title[0].plain_text,
        description: post.properties.Description.rich_text[0].plain_text,
        image: post.properties.Image.url,
        author: post.properties.Authors.people[0].name,
      }}
    >
      <div className="wrapper">
        <div className="pb-20">
          <article>
            <header className="pt-20 pb-12">
              <h1 className="text-5xl font-bold leading-normal">
                <NotionText text={post.properties.Page.title} />
              </h1>
              <div className="pt-8 text-gray-400">
                <time dateTime={post.properties.Date.date.start}>
                  {formattedDate}
                </time>
                &nbsp;&bull;&nbsp;{post.properties.Authors.people[0].name}
              </div>
            </header>

            <section className="post text-lg leading-8">{children}</section>
          </article>
        </div>
      </div>
    </Page>
  )
}
