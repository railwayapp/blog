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

  return (
    <>
      <DefaultSeo {...config} />

      <NextSeo
        {...props}
        {...(image == null
          ? {}
          : {
              openGraph: {
                images: [{ url: image }],
                article: {
                  authors: [author],
                },
              },
            })}
      />

      <Head>
        <title>{title}</title>

        <meta name="description" content={description} />

        {/* JSON-LD Schema */}
        {blogPostSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }}
          />
        )}

        {/* Breadcrumb Schema */}
        {breadcrumbSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          />
        )}

        {/* FAQ Schema */}
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
