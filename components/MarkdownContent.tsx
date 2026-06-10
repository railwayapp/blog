import Link from "@components/Link"
import { Code } from "@components/Code"
import {
  createMarkdownSlugger,
  getHeadingId,
  MarkdownSlugger,
  segmentMarkdown,
  stripMarkdown,
} from "@lib/markdown"
import React from "react"
import ReactMarkdown from "react-markdown"
import { TwitterTweetEmbed } from "react-twitter-embed"
import rehypeSanitize from "rehype-sanitize"
import remarkGfm from "remark-gfm"
import { extractTweetId, extractYoutubeId } from "utils"

type RenderMode = "page" | "rss"

interface Props {
  className?: string
  content: string
  mode?: RenderMode
}

const VIDEO_URL_PATTERN = /\.(mp4|mov|webm|ogg)(?:[?#].*)?$/i

const isVideoURL = (href?: string | null) =>
  Boolean(href && VIDEO_URL_PATTERN.test(href))

// Templates live under railway.com/deploy/<slug>; the other two prefixes are
// legacy forms kept for older content. Marketplace browse links
// (railway.com/deploy and railway.com/deploy?category=…) must NOT match,
// hence the trailing slash.
const isTemplateURL = (href?: string | null) =>
  Boolean(
    href &&
      (href.startsWith("https://railway.com/deploy/") ||
        href.startsWith("https://railway.com/new/template") ||
        href.startsWith("https://railway.com/template/"))
  )

// YouTube/template links are embeds only when the label is the URL itself
// (`[url](url)` or a bare autolink) — the shape Notion embed blocks export
// as; labeled ones are prose links and must stay inline. Video links are the
// opposite: Notion exported video blocks as `[caption](file.mp4)`, so a
// label does not make them inline (the corpus has captioned video embeds
// but no prose video links). The render branches below must follow the same
// rules, or unwrapped paragraphs and inline embeds get mismatched.
const isEmbedLink = (href: string | null | undefined, label: string) =>
  Boolean(
    href &&
      (isVideoURL(href) ||
        (label === href &&
          (extractYoutubeId(href) != null || isTemplateURL(href))))
  )

// A tweet link is only an embed when its label is the URL itself: that shape
// covers both `[url](url)` and bare GFM autolinks, i.e. what was an embed
// block before the CMS migration. Labeled tweet links stay inline links.
const getTweetEmbedId = (href: string | null | undefined, label: string) =>
  href && label === href ? extractTweetId(href) : null

const getHastText = (node: any): string =>
  (node?.children ?? [])
    .map((child: any) =>
      child?.type === "text" ? child.value ?? "" : getHastText(child)
    )
    .join("")

const hasBlockMarkdownChild = (node: any) =>
  Boolean(
    node?.children?.some((child: any) => {
      if (child?.tagName === "img") return true

      if (child?.tagName === "a") {
        const href = child.properties?.href
        const label = getHastText(child)
        return isEmbedLink(href, label) || Boolean(getTweetEmbedId(href, label))
      }

      return false
    })
  )

const getNodeText = (children: React.ReactNode): string =>
  React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child)
      }

      if (React.isValidElement(child)) {
        return getNodeText((child.props as { children?: React.ReactNode }).children)
      }

      return ""
    })
    .join("")

const isBlockChild = (child: React.ReactNode) =>
  React.isValidElement(child) &&
  (child.type === "figure" ||
    child.type === "span" && child.props["data-markdown-block"] === "true")

const renderHeading = (
  Tag: "h1" | "h2" | "h3",
  className: string,
  slugger: MarkdownSlugger,
  children: React.ReactNode
) => {
  const id = getHeadingId(getNodeText(children), slugger)

  return (
    <Link href={`#${id}`} className="relative no-underline">
      <span
        id={id}
        aria-hidden="true"
        className="absolute inline-block w-px top-[-2rem]"
      />
      <Tag className={className}>{children}</Tag>
    </Link>
  )
}

const MarkdownSegmentRenderer: React.FC<{
  content: string
  mode: RenderMode
  slugger: MarkdownSlugger
}> = ({ content, mode, slugger }) => {
  const components = {
    h1: ({ children }) =>
      renderHeading(
        "h1",
        "text-4xl font-bold leading-snug mt-16 mb-8",
        slugger,
        children
      ),
    h2: ({ children }) =>
      renderHeading("h2", "text-h2 font-bold mt-10 mb-5", slugger, children),
    h3: ({ children }) =>
      renderHeading("h3", "text-xl font-bold mt-6 mb-4", slugger, children),
    p: ({ children, node }) => {
      const childArray = React.Children.toArray(children)

      if (hasBlockMarkdownChild(node) || childArray.some(isBlockChild)) {
        return <>{children}</>
      }

      return <p className="mb-4 leading-8 text-gray-800">{children}</p>
    },
    a: ({ href, children }) => {
      const label = getNodeText(children)

      if (isVideoURL(href)) {
        return (
          <span
            className="block my-8"
            data-markdown-block="true"
          >
            <video
              controls
              playsInline
              preload="metadata"
              src={href}
              className="w-full rounded-lg"
            />
          </span>
        )
      }

      const youtubeId = href && label === href ? extractYoutubeId(href) : null
      if (youtubeId) {
        return (
          <span
            className="block my-8"
            data-markdown-block="true"
          >
            <iframe
              className="w-full rounded-lg"
              src={`https://youtube.com/embed/${youtubeId}`}
              height={550}
              title={label || "YouTube video"}
              allowFullScreen
            />
          </span>
        )
      }

      const tweetId = getTweetEmbedId(href, label)
      if (tweetId) {
        if (mode === "rss") {
          return (
            <blockquote className="twitter-tweet" data-markdown-block="true">
              <a href={href}>{href}</a>
            </blockquote>
          )
        }

        return (
          <span className="block mb-6" data-markdown-block="true">
            <TwitterTweetEmbed tweetId={tweetId} />
          </span>
        )
      }

      if (
        href &&
        label === href &&
        isTemplateURL(href)
      ) {
        return (
          <Link href={href} className="flex justify-center my-8">
            <img
              src="/button.svg"
              alt="Deploy on Railway"
              loading="lazy"
              decoding="async"
            />
          </Link>
        )
      }

      return (
        <Link href={href ?? "#"} className="underline hover:text-pink-600">
          {children}
        </Link>
      )
    },
    img: ({ alt, src, title }) => {
      if (!src) return null

      return (
        <figure className="flex flex-col my-8 space-y-2">
          <img
            src={src}
            alt={alt ?? ""}
            className="w-full rounded-lg"
            loading="lazy"
            decoding="async"
          />
          {title && <figcaption className="text-gray-600 mt-3 text-sm">{title}</figcaption>}
        </figure>
      )
    },
    blockquote: ({ children }) => (
      <blockquote className="flex flex-col my-8 border-l-4 pl-4 border-gray-100 text-gray-700 italic">
        {children}
      </blockquote>
    ),
    ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
    ol: ({ children, start }) => (
      <ol start={start} className="list-decimal pl-6 mb-4">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="mb-2 leading-8">{children}</li>,
    table: ({ children }) => (
      <div className="my-8 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-secondaryBg">{children}</thead>,
    th: ({ children }) => (
      <th className="border border-gray-100 px-4 py-3 font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-gray-100 px-4 py-3 align-top">
        {children}
      </td>
    ),
    pre: ({ children }) => <>{children}</>,
    code: ({ className, children }) => {
      const language = /language-(\w+)/.exec(className ?? "")?.[1]
      const code = String(children).replace(/\n$/, "")

      if (language) {
        if (mode === "rss") {
          return (
            <pre className="mb-6">
              <code>{code}</code>
            </pre>
          )
        }

        return <Code language={language}>{code}</Code>
      }

      // Fenced blocks without a language are still blocks: hast always
      // gives block code a trailing newline, inline code never has one.
      if (String(children).includes("\n")) {
        return (
          <pre className="mb-6">
            <code>{code}</code>
          </pre>
        )
      }

      return (
        <code className="text-pink-600 whitespace-normal break-words">
          {children}
        </code>
      )
    },
    hr: () => <hr className="my-8" />,
  }

  return (
    <ReactMarkdown
      components={components}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize]}
      skipHtml
    >
      {content}
    </ReactMarkdown>
  )
}

const Callout: React.FC<{
  content: string
  icon?: string
  mode: RenderMode
  slugger: MarkdownSlugger
}> = ({ content, icon, mode, slugger }) => (
  <div className="flex w-full p-4 my-8 rounded border border-transparent bg-blue-100">
    {icon && <div className="text-yellow-500">{icon}</div>}
    <div className="flex flex-col w-full">
      <div className={icon ? "ml-4 text-foreground" : "text-foreground"}>
        <MarkdownSegmentRenderer content={content} mode={mode} slugger={slugger} />
      </div>
    </div>
  </div>
)

export const MarkdownContent: React.FC<Props> = ({
  className,
  content,
  mode = "page",
}) => {
  const slugger = createMarkdownSlugger()
  const segments = segmentMarkdown(content)

  return (
    <div className={className}>
      {segments.map((segment, index) =>
        segment.type === "callout" ? (
          <Callout
            key={`${segment.type}-${index}`}
            content={segment.content}
            icon={segment.icon}
            mode={mode}
            slugger={slugger}
          />
        ) : (
          <MarkdownSegmentRenderer
            key={`${segment.type}-${index}`}
            content={segment.content}
            mode={mode}
            slugger={slugger}
          />
        )
      )}
    </div>
  )
}

export const markdownToPlainText = stripMarkdown
