import { getReadingTime } from "../utils"

describe("getReadingTime", () => {
  it.each([
    [null, ""],
    ["", ""],
    ["one two three", "1 min read"],
    [Array(200).fill("word").join(" "), "1 min read"],
    [Array(201).fill("word").join(" "), "2 min read"],
  ])("formats the reading time for post content", (content, expected) => {
    expect(getReadingTime(content)).toBe(expected)
  })
})
