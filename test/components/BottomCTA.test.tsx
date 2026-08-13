import { BottomCTA } from "@components/BottomCTA"
import React from "react"
import { render } from "../testUtils"

describe("BottomCTA", () => {
  it("renders the updated copy and actions", () => {
    const { getByRole, getByText, queryByText } = render(<BottomCTA />)

    expect(getByRole("heading", { name: "Ready to get started?" })).toBeTruthy()
    expect(
      getByText("Join millions of developers deploying applications on Railway")
    ).toBeTruthy()
    expect(queryByText("Your train has arrived!")).toBeNull()

    expect(
      getByRole("link", { name: "Deploy a new project" }).getAttribute("href")
    ).toBe("https://railway.com")
    expect(
      getByRole("link", { name: "Book a demo" }).getAttribute("href")
    ).toBe("https://railway.com/enterprise")
  })
})
