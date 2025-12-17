import { NotionText } from "@components/NotionText"
import Page from "@layouts/Page"
import { PostProps, MinimalRelatedPost, ListBlock } from "@lib/types"
import { Block } from "@notionhq/client/build/src/api-types"
import dayjs from "dayjs"
import React, { useMemo } from "react"
import { BottomCTA } from "../components/BottomCTA"
import { ContinueReading } from "../components/ContinueReading"
import { Divider } from "../components/Divider"
import { useOgImage } from "../hooks/useOGImage"
import { cn } from "../utils"
import { extractTableOfContents, HiddenTableOfContents } from "@lib/seo-components"
import { url } from "@components/Seo"

export interface Props {
  post: PostProps
  relatedPosts: MinimalRelatedPost[]
  blocks?: (Block | ListBlock)[]
  children?: React.ReactNode
}

export const PostPage: React.FC<Props> = ({ post, relatedPosts, blocks, children }) => {
  const formattedDate = useMemo(
    () => dayjs(post.properties.Date.date.start).format("MMM D, YYYY"),
    [post.properties.Date.date.start]
  )

  const authors = post.properties.Authors.people.filter(
    (author) => author != null && author.name != null
  )
  const ogImage = useOgImage({
    title: post.properties.Page.title[0].plain_text,
    authorName: authors.map((a) => a.name).join(" & "),
    image: post.properties?.Image?.url,
  })

  const category = post.properties.Category?.select?.name
  const slug = post.properties.Slug.rich_text[0]?.plain_text || ""
  const currentUrl = `${url}/p/${slug}`

  const tableOfContents = useMemo(() => {
    if (!blocks) return []
    // Filter out ListBlock types and only process Block types
    const blockOnly = blocks.filter((b): b is Block => 'type' in b && 'id' in b && 'has_children' in b)
    return extractTableOfContents(blockOnly)
  }, [blocks])

  return (
    <Page
      seo={{
        title: post.properties.Page.title[0].plain_text,
        description: post.properties.Description.rich_text[0].plain_text,
        image: ogImage,
        author: authors.map((a) => a.name).join(" & "),
        post,
        blocks: blocks?.filter((b): b is Block => 'type' in b && 'id' in b && 'has_children' in b),
        currentUrl,
      }}
    >
      <div className="mt-10 mb-5 px-5 md:px-8 mx-auto">
        <article
          className={cn(
            "max-w-6xl mx-auto mt-24 mb-12",
            relatedPosts.length >= 2
              ? "border-b border-gray-100 pb-32"
              : "pb-12"
          )}
        >
          <div className="flex items-center text-gray-500 space-x-3">
            {authors.length > 0 && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    {authors.map((author, index) => (
                      <img
                        key={author.name}
                        src={author.avatar_url}
                        alt={`Avatar of ${author.name}`}
                        className="w-6 h-6 rounded-full overflow-hidden border-2 border-white"
                        style={{ marginLeft: index > 0 ? "-8px" : 0 }}
                      />
                    ))}
                  </div>
                  <span>{authors.map((a) => a.name).join(" & ")}</span>
                </div>
                <Divider />
              </>
            )}
            <time dateTime={post.properties.Date.date.start}>
              {formattedDate}
            </time>
          </div>

          <header className="mt-5 mb-16 max-w-[800px]">
            <h1 className="text-huge font-bold">
              <NotionText text={post.properties.Page.title} />
            </h1>
          </header>

          <section className="max-w-[736px] mx-auto text-base sm:text-lg leading-8">
            {/* Hidden table of contents for SEO */}
            <HiddenTableOfContents items={tableOfContents} />
            {children}
          </section>
        </article>

        <div className="max-w-6xl mx-auto">
          {category != null && relatedPosts.length >= 2 && (
            <ContinueReading category={category} posts={relatedPosts} />
          )}

          <BottomCTA />
        </div>
      </div>
    </Page>
  )
}
