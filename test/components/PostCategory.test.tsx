import { PostCategory } from "@components/PostCategory"
import React from "react"
import { render } from "../testUtils"

describe("PostCategory palette", () => {
  it.each([
    ["Engineering", "plum"],
    ["News", "gold"],
    ["AI", "teal"],
    ["Guide", "blue"],
    ["Company", "wine"],
    ["Unknown", "plum"],
  ])("maps %s to the %s tone", (categoryName, tone) => {
    const { getByText } = render(
      <PostCategory category={categoryName} isCommunity={false} />
    )

    expect(getByText(categoryName).getAttribute("data-category-tone")).toBe(
      tone
    )
  })
})
