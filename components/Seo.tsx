import { DefaultSeo, NextSeo, NextSeoProps } from "next-seo"
import Head from "next/head"
import { DefaultSeoProps } from "next-seo"
import {
  generateBlogPostSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  extractFAQs,
} from "@lib/seo-components"
import { PostProps } from "@lib/types"
import { Block } from "@notionhq/client/build/src/api-types"

export interface Props extends NextSeoProps {
  title?: string
  description?: string
  image?: string
  author?: string
  post?: PostProps
  blocks?: Block[]
  currentUrl?: string
}

const title = "Railway Blog"
export const url = "https://blog.railway.com"
const description = "Blog posts from the Railway team"
const image =
  "https://og.railway.com/api/image?fileType=png&layoutName=docs&Page=Railway+Blog&Url=blog.railway.com"

const config: DefaultSeoProps = {
  title,
  description,
  openGraph: {
    type: "website",
    url,
    site_name: title,
    images: [{ url: image }],
    article: {
      authors: [],
    },
  },
  twitter: {
    handle: "@Railway_App",
    cardType: "summary_large_image",
  },
}

const SEO: React.FC<Props> = ({ image, author, post, blocks, currentUrl, ...props }) => {
  const title = props.title ?? config.title
  const description = props.description || config.description
  const fullUrl = currentUrl || url

  const blogPostSchema = post ? generateBlogPostSchema(post, fullUrl) : null
  const breadcrumbSchema = post ? generateBreadcrumbSchema(post, fullUrl) : null
  const faqSchema = blocks ? generateFAQSchema(extractFAQs(blocks)) : null

  const publishedTime = post?.properties.Date.date?.start
  const modifiedTime = post?.properties.Date.date?.start // Using same as published for now
  const postAuthors = author
    ? [author]
    : post?.properties.Authors.people
      .filter((a) => a != null && a.name != null)
      .map((a) => a.name) || []
  const section = post?.properties.Category?.select?.name
  const postImage = image || post?.properties.Image?.url

  return (
    <>
      <DefaultSeo {...config} />

      <NextSeo
        {...props}
        canonical={fullUrl}
        {...(postImage == null
          ? {}
          : {
            openGraph: {
              images: [{ url: postImage }],
              article: {
                authors: postAuthors,
                publishedTime: publishedTime,
                modifiedTime: modifiedTime,
                section: section,
              },
            },
          })}
      />

      <Head>
        <title>{title}</title>

        <meta name="description" content={description} />

        <link rel="canonical" href={fullUrl} />

        {publishedTime && (
          <meta property="article:published_time" content={publishedTime} />
        )}
        {modifiedTime && (
          <meta property="article:modified_time" content={modifiedTime} />
        )}
        {postAuthors.map((postAuthor) => (
          <meta key={postAuthor} property="article:author" content={postAuthor} />
        ))}
        {section && (
          <meta property="article:section" content={section} />
        )}

        {blogPostSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }}
          />
        )}

        {breadcrumbSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          />
        )}

        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
        )}
      </Head>
    </>
  )
}

export default SEO
