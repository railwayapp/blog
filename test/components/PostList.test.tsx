import React from "react"
import { fireEvent, render } from "../testUtils"
import { PostList } from "@components/PostList"
import { BlogCategory, BlogPost } from "@lib/types"

jest.mock("next/router", () => ({
  useRouter: () => ({
    asPath: "/engineering",
  }),
}))

const category: BlogCategory = {
  id: "c1",
  slug: "engineering",
  title: "Engineering",
}

const makePost = (i: number): BlogPost => ({
  id: `${i}`,
  slug: `post-${i}`,
  title: `Post ${i}`,
  description: `Description ${i}`,
  content: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  publishedAt: "2026-01-02T00:00:00.000Z",
  updatedAt: "2026-01-03T00:00:00.000Z",
  featured: false,
  externalAuthor: false,
  featuredImage: null,
  socialImage: null,
  authors: [],
  category,
})

const posts = Array.from({ length: 12 }, (_, i) => makePost(i + 1))

describe("PostList crawlable links", () => {
  it("server-renders every post link, with posts beyond the fold in a hidden list", () => {
    const { container } = render(
      <PostList posts={posts} categories={[]} category={category} />
    )

    const hrefs = Array.from(
      container.querySelectorAll('a[href^="/p/"]')
    ).map((a) => a.getAttribute("href"))
    for (let i = 1; i <= 12; i++) {
      expect(hrefs).toContain(`/p/post-${i}`)
    }

    const hidden = container.querySelector("ul.hidden")
    expect(hidden).not.toBeNull()
    const hiddenHrefs = Array.from(
      hidden!.querySelectorAll("a")
    ).map((a) => a.getAttribute("href"))
    expect(hiddenHrefs).toEqual([
      "/p/post-9",
      "/p/post-10",
      "/p/post-11",
      "/p/post-12",
    ])
  })

  it("replaces the hidden list with full cards on Load more", () => {
    const { container, getByText } = render(
      <PostList posts={posts} categories={[]} category={category} />
    )

    fireEvent.click(getByText("Load more posts..."))

    expect(container.querySelector("ul.hidden")).toBeNull()
    const hrefs = Array.from(
      container.querySelectorAll('a[href^="/p/"]')
    ).map((a) => a.getAttribute("href"))
    expect(hrefs).toHaveLength(12)
  })

})

describe("PostList heading semantics", () => {
  it("uses an h1 on category pages (their only h1)", () => {
    const { getByRole } = render(
      <PostList posts={posts} categories={[]} category={category} />
    )

    expect(getByRole("heading", { level: 1 }).textContent).toBeTruthy()
  })

  it("renders the h1 even when every post in the category is featured", () => {
    const featuredOnly = posts.slice(0, 2).map((post) => ({
      ...post,
      featured: true,
      featuredImage: {
        id: "m1",
        url: "https://cms.railway.com/media/cover.png",
        alt: "cover",
      },
    }))
    const { getByRole, container } = render(
      <PostList posts={featuredOnly} categories={[]} category={category} />
    )

    expect(getByRole("heading", { level: 1 }).textContent).toBeTruthy()
    expect(container.querySelector("ul.hidden")).toBeNull()
  })

  it("keeps an h2 on the homepage, which has its own h1", () => {
    const { getByRole, queryByRole } = render(
      <PostList posts={posts} categories={[]} />
    )

    expect(queryByRole("heading", { level: 1 })).toBeNull()
    expect(getByRole("heading", { level: 2 }).textContent).toBe("Everything")
  })
})
