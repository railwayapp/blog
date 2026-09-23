import { getAuthorsFromPosts } from "../lib/cms"
import {
  BLOG_DESCRIPTION,
  generateBlogPostSchema,
  generateCollectionPageSchema,
  generatePersonSchema,
  getCategoryDescription,
} from "../lib/seo-components"
import { BlogAuthor, BlogPost } from "../lib/types"

const author = (slug: string, name = slug): BlogAuthor => ({
  avatar: null,
  avatarUrl: null,
  githubUrl: `https://github.com/${slug}`,
  id: slug,
  name,
  slug,
  title: "Engineer",
})

const post = (slug: string, authors: BlogAuthor[]): BlogPost => ({
  authors,
  category: { id: "1", slug: "guide", title: "Guide" },
  content: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  description: "desc",
  externalAuthor: false,
  featured: false,
  featuredImage: null,
  id: slug,
  publishedAt: "2026-01-01T00:00:00.000Z",
  slug,
  socialImage: null,
  title: slug,
  updatedAt: "2026-02-01T00:00:00.000Z",
})

describe("getCategoryDescription", () => {
  it("prefers the CMS SEO description", () => {
    expect(
      getCategoryDescription({
        id: "1",
        slug: "guide",
        title: "Guide",
        seoDescription: "cms",
      })
    ).toBe("cms")
  })

  it("falls back to a per-category description instead of the site default", () => {
    const description = getCategoryDescription({
      id: "1",
      slug: "engineering",
      title: "Engineering",
    })
    expect(description).toBeTruthy()
    expect(description).not.toBe(BLOG_DESCRIPTION)
  })

  it("returns undefined for unknown categories without CMS copy", () => {
    expect(
      getCategoryDescription({ id: "1", slug: "new", title: "New" })
    ).toBeUndefined()
  })
})

describe("author schema", () => {
  it("links each Person to its author page and GitHub profile", () => {
    expect(generatePersonSchema(author("ada", "Ada"))).toMatchObject({
      "@type": "Person",
      name: "Ada",
      url: "https://blog.railway.com/author/ada",
      sameAs: ["https://github.com/ada"],
      jobTitle: "Engineer",
    })
  })

  it("uses linked Person authors in BlogPosting", () => {
    const schema = generateBlogPostSchema(post("p", [author("ada")]), "u") as {
      author: { url: string }
    }
    expect(schema.author.url).toBe("https://blog.railway.com/author/ada")
  })
})

describe("getAuthorsFromPosts", () => {
  it("dedupes authors and orders them by post count", () => {
    const a = author("a")
    const b = author("b")
    const authors = getAuthorsFromPosts([post("1", [a]), post("2", [b, a])])
    expect(authors.map((x) => x.slug)).toEqual(["a", "b"])
  })
})

describe("generateCollectionPageSchema", () => {
  it("lists every post as an ItemList entry", () => {
    const schema = generateCollectionPageSchema({
      name: "Guides",
      url: "https://blog.railway.com/guides",
      posts: [post("one", []), post("two", [])],
    }) as { "@type": string; hasPart: { itemListElement: { url: string }[] } }
    expect(schema["@type"]).toBe("CollectionPage")
    expect(schema.hasPart.itemListElement.map((i) => i.url)).toEqual([
      "https://blog.railway.com/p/one",
      "https://blog.railway.com/p/two",
    ])
  })
})
