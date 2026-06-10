import React from "react"
import { render } from "../testUtils"
import { Categories } from "../../components/Categories"
import { BlogCategory } from "@lib/types"

jest.mock("next/router", () => ({
  useRouter: () => ({
    asPath: "/",
  }),
}))

const category = (overrides: Partial<BlogCategory>): BlogCategory => ({
  id: "1",
  slug: "news",
  title: "News",
  ...overrides,
})

describe("Categories navigation", () => {
  it("hides categories with showInNavigation set to false", () => {
    const { queryByText } = render(
      <Categories
        categories={[
          category({ id: "1", slug: "news", title: "News" }),
          category({
            id: "2",
            slug: "engineering",
            title: "Engineering",
            showInNavigation: false,
          }),
        ]}
      />,
      {}
    )

    expect(queryByText("News")).toBeTruthy()
    expect(queryByText("Engineering")).toBeNull()
  })

  it("shows categories when the field is true or not present yet", () => {
    const { queryByText } = render(
      <Categories
        categories={[
          category({ id: "1", slug: "news", title: "News", showInNavigation: true }),
          category({
            id: "2",
            slug: "engineering",
            title: "Engineering",
            showInNavigation: null,
          }),
        ]}
      />,
      {}
    )

    expect(queryByText("News")).toBeTruthy()
    expect(queryByText("Engineering")).toBeTruthy()
  })
})
