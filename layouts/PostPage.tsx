import { MarkdownContent } from "@components/MarkdownContent"
import { url } from "@components/Seo"
import {
  HiddenTableOfContents,
  buildMetaDescription,
  buildSeoTitle,
  extractTableOfContents,
} from "@lib/seo-components"
import Page from "@layouts/Page"
import { BlogPost } from "@lib/types"
import React, { useMemo } from "react"
import { BottomCTA } from "../components/BottomCTA"
import { ContinueReading } from "../components/ContinueReading"
import { Divider } from "../components/Divider"
import { useOgImage } from "../hooks/useOGImage"
import { cn, formatPostDate } from "../utils"

export interface Props {
  post: BlogPost
  relatedPosts: BlogPost[]
}

export const PostPage: React.FC<Props> = ({ post, relatedPosts }) => {
  const formattedDate = useMemo(
    () => formatPostDate(post.publishedAt),
    [post.publishedAt]
  )

  const authorName = post.authors.map((author) => author.name).join(" & ")
  const singleAuthor = post.authors.length === 1 ? post.authors[0] : null
  const ogImage = useOgImage({
    title: post.title,
    authorName,
    role: singleAuthor?.title ?? undefined,
    avatarUrl: singleAuthor?.avatarUrl ?? undefined,
    eyebrow: post.category?.title,
    image: post.socialImage?.url ?? undefined,
  })

  const currentUrl = `${url}/p/${post.slug}`
  const tableOfContents = useMemo(
    () => extractTableOfContents(post.content ?? ""),
    [post.content]
  )

  return (
    <Page
      seo={{
        title: post.seoTitle ?? buildSeoTitle(post.title),
        description:
          post.seoDescription ?? buildMetaDescription(post.description),
        image: ogImage,
        author: authorName,
        post,
        content: post.content,
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
          <div className="max-w-[736px] mx-auto flex items-center text-gray-500 space-x-3">
            {post.authors.length > 0 && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    {post.authors
                      .filter((author) => author.avatarUrl)
                      .map((author, index) => (
                        <img
                          key={author.id}
                          src={author.avatarUrl}
                          alt={`Avatar of ${author.name}`}
                          className="w-6 h-6 rounded-full overflow-hidden border-2 border-white"
                          style={{ marginLeft: index > 0 ? "-8px" : 0 }}
                          loading="lazy"
                          decoding="async"
                          width={24}
                          height={24}
                        />
                      ))}
                  </div>
                  <span>{authorName}</span>
                </div>
                <Divider />
              </>
            )}
            <time dateTime={post.publishedAt}>{formattedDate}</time>
          </div>

          <header className="mt-5 mb-16 max-w-[736px] mx-auto">
            <h1 className="text-6xl font-medium font-serif">{post.title}</h1>
          </header>

          <section className="max-w-[736px] mx-auto text-base sm:text-lg leading-8">
            <HiddenTableOfContents items={tableOfContents} />
            <MarkdownContent content={post.content ?? ""} />
          </section>
        </article>

        <div className="max-w-6xl mx-auto">
          {post.category != null && relatedPosts.length >= 2 && (
            <ContinueReading category={post.category} posts={relatedPosts} />
          )}

          <BottomCTA />
        </div>
      </div>
    </Page>
  )
}
