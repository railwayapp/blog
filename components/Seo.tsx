import { DefaultSeo, NextSeo, NextSeoProps } from "next-seo"
import Head from "next/head"
import { DefaultSeoProps } from "next-seo"
import {
  generateBlogPostSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  extractFAQs,
} from "@lib/seo-components"
import { BlogPost } from "@lib/types"

export interface Props extends NextSeoProps {
  title?: string
  description?: string
  image?: string
  author?: string
  post?: BlogPost
  content?: string | null
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

const SEO: React.FC<Props> = ({ image, author, post, content, currentUrl, ...props }) => {
  const title = props.title ?? config.title
  const description = props.description || config.description
  const fullUrl = currentUrl || url

  const blogPostSchema = post ? generateBlogPostSchema(post, fullUrl) : null
  const breadcrumbSchema = post ? generateBreadcrumbSchema(post, fullUrl) : null
  const faqSchema = content ? generateFAQSchema(extractFAQs(content)) : null

  const publishedTime = post?.publishedAt
  const modifiedTime = post?.updatedAt
  const postAuthors = author
    ? [author]
    : post?.authors.map((a) => a.name) || []
  const section = post?.category?.title
  const postImage = image || post?.socialImage?.url || post?.featuredImage?.url

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
