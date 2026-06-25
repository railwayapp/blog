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
import { buildCMSImageURL } from "@lib/cms/image"

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
    images: [{ url: image, width: 1200, height: 630, type: "image/png" }],
  },
  twitter: {
    // Railway's X account is @Railway (x.com/Railway); @Railway_App is stale.
    site: "@Railway",
    handle: "@Railway",
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
  // A raw CMS media URL (cms.railway.com/media/…) 307-redirects to a
  // short-lived signed storage URL, which social scrapers (Discord, X) fail to
  // render. Route it through the imgproxy gateway to get a stable, CDN-cached
  // 200. Non-CMS URLs (the og.railway.com dynamic card, manual escape hatches)
  // pass through untouched.
  const rawImage = image || post?.socialImage?.url || post?.featuredImage?.url
  const postImage = rawImage
    ? buildCMSImageURL(rawImage, { width: 1200 })
    : undefined

  // The CMS media behind the OG image, so we can declare its dimensions/type.
  // Slack and X render the large-image card more reliably when og:image:width/
  // height are present (and skip a fetch round-trip to detect them).
  const ogMedia =
    post?.socialImage?.url === rawImage
      ? post?.socialImage
      : post?.featuredImage?.url === rawImage
        ? post?.featuredImage
        : null
  // Every OG image we serve is 1200 wide: the gateway transform caps width at
  // 1200, and the dynamic og.railway.com card renders at 1200×630. Height is
  // scaled from the source aspect ratio; the dynamic card defaults to 630.
  const isDynamicCard = rawImage?.startsWith("https://og.railway.com") ?? false
  const ogImageMeta =
    ogMedia?.width && ogMedia?.height
      ? {
          width: 1200,
          height: Math.round((1200 * ogMedia.height) / ogMedia.width),
          type: ogMedia.mimeType ?? "image/png",
        }
      : isDynamicCard
        ? { width: 1200, height: 630, type: "image/png" }
        : null

  // next-seo's `twitter` config only emits card/site/creator; Twitter falls
  // back to og:* for the rest. Mirror title/description/image explicitly so the
  // card is unambiguous across scrapers (Slack reads these too).
  const twitterMetaTags = [
    { name: "twitter:title", content: props.title || title },
    { name: "twitter:description", content: description },
    ...(postImage ? [{ name: "twitter:image", content: postImage }] : []),
  ]

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
        additionalMetaTags={twitterMetaTags}
        // next-seo only emits og:url when an openGraph config is present, so
        // always pass one to keep og:url aligned with the canonical. The
        // article block requires type:"article" or next-seo drops it.
        openGraph={{
          url: fullUrl,
          ...(postImage != null && {
            images: [{ url: postImage, ...(ogImageMeta ?? {}) }],
          }),
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
