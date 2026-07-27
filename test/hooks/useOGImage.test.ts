import { useOgImage } from "../../hooks/useOGImage"

describe("useOgImage", () => {
  it("sets the post reading time on generated blog cards", () => {
    const url = new URL(
      useOgImage({
        title: "Scaling Railway",
        authorName: "Mahmoud Abdelwahab",
        readTime: "4 min read",
      })
    )

    expect(url.searchParams.get("ReadTime")).toBe("4 min read")
  })

  it("sets an empty reading time when post content is unavailable", () => {
    const url = new URL(
      useOgImage({
        title: "Scaling Railway",
        authorName: "Mahmoud Abdelwahab",
      })
    )

    expect(url.searchParams.has("ReadTime")).toBe(true)
    expect(url.searchParams.get("ReadTime")).toBe("")
  })
})
