import { DefaultSeo, NextSeo, NextSeoProps } from "next-seo"
import Head from "next/head"
import { DefaultSeoProps } from "next-seo"

export interface Props extends NextSeoProps {
  title?: string
  description?: string
  image?: string
  author?: string
}

const title = "Railway Blog"
export const url = "https://blog.railway.app"
const description = "Blog posts from the Railway team"
const image =
  "https://og.railway.app/api/image?fileType=png&layoutName=docs&Page=Railway+Blog&Url=blog.railway.app"

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

const SEO: React.FC<Props> = ({ image, author, ...props }) => {
  const title = props.title ?? config.title
  const description = props.description || config.description

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
      </Head>
    </>
  )
}

export default SEO
