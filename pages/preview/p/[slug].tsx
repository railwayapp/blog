import { PostPage } from "@layouts/PostPage"
import Page from "@layouts/Page"
import { previewHeaders } from "@lib/cms/preview"
import { getPreviewPost } from "@lib/cms/preview.server"
import { BlogPost } from "@lib/types"
import { GetServerSideProps } from "next"

interface Props {
  post: BlogPost | null
  unavailable?: boolean
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  query,
  res,
}) => {
  for (const [name, value] of Object.entries(previewHeaders))
    res.setHeader(name, value)
  try {
    const post = await getPreviewPost(params?.slug, query.cmsPreview)
    if (!post) res.statusCode = 404
    return { props: { post } }
  } catch {
    // Do not log fetch errors: they can contain the credential-bearing URL.
    res.statusCode = 503
    return { props: { post: null, unavailable: true } }
  }
}

export default function PreviewPost({ post, unavailable }: Props) {
  if (post) return <PostPage post={post} relatedPosts={[]} preview />
  return (
    <Page seo={{ preview: true }}>
      <main className="mx-auto max-w-[704px] px-5 pt-32 pb-24">
        <h1 className="text-3xl font-serif">Preview unavailable</h1>
        <p className="mt-4 text-gray-600">
          {unavailable
            ? "We couldn't load this preview. Please try again shortly."
            : "This link is invalid or no longer active. Ask the author for a new preview link."}
        </p>
      </main>
    </Page>
  )
}
