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

// Raw JSON.stringify output is unsafe inside a <script>: a CMS-authored
// string containing "</script>" would close the tag and execute whatever
// follows. Escaping "<" to its unicode form parses back to the same string,
// so crawlers see identical JSON-LD.
export const serializeSchema = (schema: object) =>
  JSON.stringify(schema).replace(/</g, "\\u003c")

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
  },
  twitter: {
    handle: "@Railway_App",
    cardType: "summary_large_image",
  },
}

const SEO: React.FC<Props> = ({ image, author, post, content, currentUrl, ...props }) => {
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
        // Explicit so exactly one keyed description tag wins the next/head
        // dedupe; an un-keyed copy of this tag is what Ahrefs flagged as
        // "Multiple meta description tags" on every page.
        description={description}
        canonical={fullUrl}
        // next-seo only emits og:url when an openGraph config is present, so
        // always pass one to keep og:url aligned with the canonical. The
        // article block requires type:"article" or next-seo drops it.
        openGraph={{
          url: fullUrl,
          ...(postImage != null && { images: [{ url: postImage }] }),
          ...(post != null && {
            type: "article",
            article: {
              authors: postAuthors,
              publishedTime: publishedTime,
              modifiedTime: modifiedTime,
              section: section,
            },
          }),
        }}
      />

      <Head>
        {blogPostSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeSchema(blogPostSchema) }}
          />
        )}

        {breadcrumbSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeSchema(breadcrumbSchema) }}
          />
        )}

        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeSchema(faqSchema) }}
          />
        )}
      </Head>
    </>
  )
}

export default SEO
