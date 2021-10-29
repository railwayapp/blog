import dayjs from "dayjs"
import React, { useMemo } from "react"
import { ArrowLeft } from "react-feather"

import { PostProps } from "@lib/types"

import Page from "@layouts/Page"
import Link from "@components/Link"
import { NotionText } from "@components/NotionText"

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
      }}
    >
      <div className="wrapper">
        <div className="pb-20">
          <article>
            <header className="pt-20 pb-12">
              <h1 className="text-5xl font-bold leading-tight">
                <NotionText text={post.properties.Page.title} />
              </h1>

              <div className="pt-8 text-gray-400">{formattedDate}</div>
            </header>

            <section className="prose lg:prose-lg">{children}</section>
          </article>

          <div className="pt-12">
            <Link href="/" className="flex text-gray-500 hover:text-primary">
              <ArrowLeft className="mr-4" />
              Back to posts
            </Link>
          </div>
        </div>
      </div>
    </Page>
  )
}
