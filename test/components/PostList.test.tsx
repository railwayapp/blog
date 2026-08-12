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

    const heading = getByRole("heading", { level: 1 })
    expect(heading.textContent).toBeTruthy()
    expect(heading.className).toContain("font-semibold")
    expect(heading.className).not.toContain("font-bold")
  })

  it("renders featured category posts as standard cards below the h1", () => {
    const featuredOnly = posts.slice(0, 2).map((post) => ({
      ...post,
      featured: true,
      featuredImage: {
        id: "m1",
        url: "https://cms.railway.com/media/cover.png",
        alt: "cover",
      },
    }))
    const { getByRole, queryByRole, container } = render(
      <PostList posts={featuredOnly} categories={[]} category={category} />
    )

    const heading = getByRole("heading", { level: 1 })
    const standardGrid = heading.nextElementSibling

    expect(queryByRole("heading", { level: 3 })).toBeNull()
    expect(standardGrid?.querySelectorAll('a[href^="/p/"]')).toHaveLength(2)
    expect(container.querySelector('img[alt="cover"]')).toBeNull()
    expect(container.querySelector("ul.hidden")).toBeNull()
  })

  it("keeps an h2 on the homepage, which has its own h1", () => {
    const { getByRole, queryByRole } = render(
      <PostList posts={posts} categories={[]} />
    )

    expect(queryByRole("heading", { level: 1 })).toBeNull()
    expect(getByRole("heading", { level: 2 }).textContent).toBe("Everything")
  })

  it("places homepage and category headings above a three-column post grid", () => {
    const { getByRole, rerender } = render(
      <PostList posts={posts} categories={[]} />
    )

    const expectHeadingAboveGrid = (level: 1 | 2) => {
      const heading = getByRole("heading", { level })
      const grid = heading.nextElementSibling

      expect(heading.parentElement?.className).not.toContain("lg:grid-cols-3")
      expect(grid?.className).toContain("lg:grid-cols-3")
      expect(grid?.className).not.toContain("lg:col-span-2")
    }

    expectHeadingAboveGrid(2)
    expect(getByRole("heading", { level: 2 }).parentElement?.className).toContain(
      "mt-16"
    )

    rerender(
      <PostList posts={posts} categories={[]} category={category} />
    )
    expectHeadingAboveGrid(1)
    expect(getByRole("heading", { level: 1 }).parentElement?.className).toContain(
      "mt-24"
    )
  })
})

describe("PostList typography", () => {
  it("uses the H2 and H3 type tokens on the homepage", () => {
    const featuredPost = { ...makePost(1), featured: true }
    const standardPost = makePost(2)
    const { getByRole } = render(
      <PostList posts={[featuredPost, standardPost]} categories={[]} />
    )

    expect(getByRole("heading", { level: 2 }).className).toContain("text-h2")
    expect(getByRole("heading", { level: 3 }).className).toContain("text-h3")
  })

  it("uses the homepage category-pill treatment", () => {
    const featuredPost = { ...makePost(1), featured: true }
    const standardPost = makePost(2)
    const { container, rerender } = render(
      <PostList posts={[featuredPost, standardPost]} categories={[]} />
    )

    const pills = container.querySelectorAll(".homepage-category-pill")
    expect(pills).toHaveLength(2)
    pills.forEach((pill) => {
      expect(pill.className).toContain("text-xs")
      expect(pill.className).toContain("uppercase")
      expect(pill.className).not.toContain("font-mono")
      expect(pill.className).toContain("tracking-[0.06em]")
      expect(pill.className).toContain("px-2")
      expect(pill.className).toContain("py-[3px]")
      expect(pill.className).toContain("rounded-[4px]")
    })

    rerender(
      <PostList
        posts={[featuredPost, standardPost]}
        categories={[]}
        category={category}
      />
    )
    expect(container.querySelectorAll(".homepage-category-pill")).toHaveLength(
      0
    )
  })

  it("uses the secondary tone for featured and standard descriptions", () => {
    const featuredPost = { ...makePost(1), featured: true }
    const standardPost = makePost(2)
    const { getByText } = render(
      <PostList posts={[featuredPost, standardPost]} categories={[]} />
    )

    expect(getByText("Description 1").className).toContain(
      "text-lg text-gray-600"
    )
    expect(getByText("Description 2").className).toContain(
      "text-base text-gray-600"
    )
  })
})
