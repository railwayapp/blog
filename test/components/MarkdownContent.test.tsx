import React from "react"
import { render, screen } from "../testUtils"
import { MarkdownContent } from "@components/MarkdownContent"

// Code pulls in shiki's ESM-only build, which Jest cannot parse.
jest.mock("@components/Code", () => ({
  Code: ({ children }: { children: string }) => <pre>{children}</pre>,
}))

jest.mock("react-twitter-embed", () => ({
  TwitterTweetEmbed: ({ tweetId }: { tweetId: string }) => (
    <div data-testid="tweet-embed" data-tweet-id={tweetId} />
  ),
}))

describe("MarkdownContent tweet embeds", () => {
  it("renders a standalone [url](url) tweet link as an embed", () => {
    const url = "https://twitter.com/Altimor/status/1660725218925776896"
    const { container } = render(<MarkdownContent content={`[${url}](${url})`} />)

    expect(
      screen.getByTestId("tweet-embed").getAttribute("data-tweet-id")
    ).toBe("1660725218925776896")
    expect(container.querySelector(`a[href="${url}"]`)).toBeNull()
    // The embed must not be wrapped in a styled paragraph
    expect(container.querySelector("p")).toBeNull()
  })

  it("renders a bare autolinked tweet URL as an embed", () => {
    render(
      <MarkdownContent content="https://x.com/cramforce/status/1975656443954274780" />
    )

    expect(
      screen.getByTestId("tweet-embed").getAttribute("data-tweet-id")
    ).toBe("1975656443954274780")
  })

  it("keeps inline tweet links with their own label as plain links", () => {
    const url = "https://x.com/JustJake/status/1667478906591666176?s=20"
    const { container } = render(
      <MarkdownContent content={`So I started [tweeting](${url}).`} />
    )

    expect(screen.queryByTestId("tweet-embed")).toBeNull()
    const link = container.querySelector(`a[href="${url}"]`)
    expect(link).not.toBeNull()
    expect(link?.textContent).toBe("tweeting")
  })

  it("keeps profile links as plain links", () => {
    const url = "https://twitter.com/paulgb"
    const { container } = render(
      <MarkdownContent content={`[${url}](${url})`} />
    )

    expect(screen.queryByTestId("tweet-embed")).toBeNull()
    expect(container.querySelector(`a[href="${url}"]`)).not.toBeNull()
  })

  it("renders the twitter-tweet blockquote in rss mode", () => {
    const url = "https://twitter.com/Altimor/status/1660725218925776896"
    const { container } = render(
      <MarkdownContent content={`[${url}](${url})`} mode="rss" />
    )

    expect(screen.queryByTestId("tweet-embed")).toBeNull()
    const blockquote = container.querySelector("blockquote.twitter-tweet")
    expect(blockquote).not.toBeNull()
    expect(blockquote?.querySelector(`a[href="${url}"]`)).not.toBeNull()
  })
})

describe("MarkdownContent embed links", () => {
  // Regression: labeled YouTube links in prose (marathon-tv-app's [*Shogun*],
  // how-we-write-changelogs) were unwrapped and rendered as 550px iframes
  // mid-sentence. Prod rendered them as plain links.
  it("keeps a labeled YouTube link inline within its styled paragraph", () => {
    const url = "https://www.youtube.com/watch?v=yAN5uspO_hk"
    const { container } = render(
      <MarkdownContent
        content={`We were checking out [*Shogun*](${url}), which was popular.`}
      />
    )

    expect(container.querySelector("iframe")).toBeNull()
    const link = container.querySelector(`a[href="${url}"]`)
    expect(link?.textContent).toBe("Shogun")
    const paragraph = container.querySelector("p")
    expect(paragraph?.className).toContain("mb-4")
    expect(paragraph?.textContent).toContain("which was popular.")
  })

  it("renders a standalone [url](url) YouTube link as a block embed", () => {
    const url = "https://www.youtube.com/watch?v=yAN5uspO_hk"
    const { container } = render(<MarkdownContent content={`[${url}](${url})`} />)

    const iframe = container.querySelector("iframe")
    expect(iframe?.getAttribute("src")).toBe(
      "https://youtube.com/embed/yAN5uspO_hk"
    )
    expect(container.querySelector("p")).toBeNull()
  })

  it("renders a bare autolinked YouTube URL as a block embed", () => {
    const { container } = render(
      <MarkdownContent content="https://youtu.be/tB2ZWBFEL-Y" />
    )

    expect(container.querySelector("iframe")).not.toBeNull()
    expect(container.querySelector("p")).toBeNull()
  })

  // Notion exported video blocks as [caption](file.mp4) — a label must NOT
  // demote them to inline links (46 captioned video embeds in the corpus).
  it("keeps a labeled video link as a block player", () => {
    const url = "https://cms.railway.com/media/abc123.mp4"
    const { container } = render(
      <MarkdownContent content={`[Undo volume deletion](${url})`} />
    )

    expect(container.querySelector("video")?.getAttribute("src")).toBe(url)
    expect(container.querySelector(`a[href="${url}"]`)).toBeNull()
    expect(container.querySelector("p")).toBeNull()
  })

  it("keeps a labeled template link inline within its styled paragraph", () => {
    const url = "https://railway.com/deploy/hermes-agent-railway"
    const { container } = render(
      <MarkdownContent content={`Deploy [Next.js](${url}) today.`} />
    )

    expect(container.querySelector("img")).toBeNull()
    const link = container.querySelector(`a[href="${url}"]`)
    expect(link?.textContent).toBe("Next.js")
    const paragraph = container.querySelector("p")
    expect(paragraph?.className).toContain("mb-4")
    expect(paragraph?.textContent).toContain("today.")
  })

  it("renders a standalone template link as the deploy button", () => {
    const url = "https://railway.com/deploy/hermes-agent-railway"
    const { container } = render(<MarkdownContent content={`[${url}](${url})`} />)

    const img = container.querySelector("img")
    expect(img?.getAttribute("alt")).toBe("Deploy on Railway")
    expect(container.querySelector("p")).toBeNull()
  })

  it("renders the deploy button for legacy template URL forms", () => {
    for (const url of [
      "https://railway.com/template/yDom4a",
      "https://railway.com/new/template?code=abc",
    ]) {
      const { container } = render(
        <MarkdownContent content={`[${url}](${url})`} />
      )

      expect(container.querySelector("img")?.getAttribute("alt")).toBe(
        "Deploy on Railway"
      )
    }
  })

  it("keeps a marketplace browse link inline instead of embedding it", () => {
    const url = "https://railway.com/deploy?category=Storage"
    const { container } = render(<MarkdownContent content={`[${url}](${url})`} />)

    expect(container.querySelector("img")).toBeNull()
    expect(container.querySelector(`a[href="${url}"]`)?.textContent).toBe(url)
  })

  it("does not render the deploy button for a URL that merely contains a template URL", () => {
    const url =
      "https://evil.example.com/?next=https://railway.com/deploy/hermes-agent-railway"
    const { container } = render(<MarkdownContent content={`[${url}](${url})`} />)

    expect(container.querySelector("img")).toBeNull()
    const link = container.querySelector(`a[href="${url}"]`)
    expect(link?.textContent).toBe(url)
  })
})

describe("MarkdownContent ordered lists", () => {
  it("preserves the start offset when a block splits a numbered list", () => {
    const content = [
      "1. step one",
      "2. step two",
      "",
      "```",
      "railway up",
      "```",
      "",
      "3. step three",
      "4. step four",
    ].join("\n")
    const { container } = render(<MarkdownContent content={content} />)

    const lists = container.querySelectorAll("ol")
    expect(lists).toHaveLength(2)
    // Lists that start at 1 must stay attribute-free (byte parity with prod).
    expect(lists[0].getAttribute("start")).toBeNull()
    expect(lists[1].getAttribute("start")).toBe("3")
  })
})
