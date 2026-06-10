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
