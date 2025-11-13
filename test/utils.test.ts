import { extractYoutubeId } from "../utils"

describe("extractYoutubeId", () => {
  it("handles watch URLs with extra parameters", () => {
    const url =
      "https://www.youtube.com/watch?feature=share&v=dQw4w9WgXcQ&t=30s"
    expect(extractYoutubeId(url)).toBe("dQw4w9WgXcQ")
  })

  it("returns null when id is missing", () => {
    const url = "https://www.youtube.com/watch?feature=share"
    expect(extractYoutubeId(url)).toBeNull()
  })

  it("extracts id from short URLs with params", () => {
    const url = "https://youtu.be/dQw4w9WgXcQ?si=abc"
    expect(extractYoutubeId(url)).toBe("dQw4w9WgXcQ")
  })
})
