import React from "react"
import { render } from "../testUtils"
import Home from "../../pages/index"

jest.mock("@lib/rss", () => ({
  generateRssFeed: jest.fn(),
}))

jest.mock("next/router", () => ({
  useRouter: () => ({
    asPath: "/",
  }),
}))

describe("Home page", () => {
  it("matches snapshot", () => {
    const { asFragment } = render(
      <Home posts={[]} categories={[]} preview={false} />,
      {}
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
