import { extractTweetId, extractYoutubeId, formatPostDate } from "../utils"

describe("extractYoutubeId", () => {
  it.each([
    ["https://youtu.be/tB2ZWBFEL-Y", "tB2ZWBFEL-Y"],
    ["https://www.youtube.com/watch?v=R_nuZD4Y7IM", "R_nuZD4Y7IM"],
    ["https://youtube.com/watch?v=R_nuZD4Y7IM", "R_nuZD4Y7IM"],
    ["https://youtu.be/vj5PA_D03Vg?t=858", "vj5PA_D03Vg"],
    ["https://youtu.be/v_ocy_2P-kI?feature=shared", "v_ocy_2P-kI"],
    ["https://www.youtube.com/watch?feature=share&v=DrTnowASuqo", "DrTnowASuqo"],
    ["https://www.youtube.com/watch?v=DrTnowASuqo&t=30s", "DrTnowASuqo"],
    ["https://www.youtube.com/embed/yAN5uspO_hk", "yAN5uspO_hk"],
    ["https://www.youtube.com/shorts/yAN5uspO_hk", "yAN5uspO_hk"],
  ])("extracts the video id from %s", (url, id) => {
    expect(extractYoutubeId(url)).toBe(id)
  })

  // Regression: URLs that merely contain "v/" (.dev/.gov/.tv domains) used to
  // be treated as YouTube videos and rendered as broken <iframe> embeds.
  it.each([
    "https://vector.dev/docs/reference/configuration/sinks/datadog_metrics/",
    "https://svelte.dev/docs/kit/introduction",
    "https://pkg.go.dev/github.com/moby/buildkit",
    "https://vitest.dev/guide/",
    "https://pub.dev/packages/rxdart",
    "https://v8.dev/blog/code-caching",
    "https://akdeepankar.hashnode.dev/build-a-team",
    "https://www.nasa.gov/intelligent-systems-division/#turbofan",
    "https://Twitch.tv/roxcodes",
    "https://demos.y-sweet.dev/code-editor",
    "https://tools.slack.dev/bolt-js/getting-started#setting-up-events",
    "https://www.youtube.com/playlist?list=PLSQGbUjHc6bpaAgCiQPzNxiUPr7SkDAFR",
    "https://railway.com/watch?v=nope.example/embed/x",
    "not a url",
  ])("returns null for %s", (url) => {
    expect(extractYoutubeId(url)).toBeNull()
  })
})

// Regression: CMS publish dates are midnight-UTC timestamps. Formatting them
// in local time rendered "May 5" for visitors west of UTC while the server
// said "May 6", breaking hydration. These must pass regardless of the TZ the
// test process runs in.
describe("formatPostDate", () => {
  it.each([
    ["2024-05-06T00:00:00.000Z", "May 6, 2024"],
    ["2021-04-29T00:00:00.000Z", "Apr 29, 2021"],
    // Timestamps with an offset format as their UTC calendar day, matching
    // what the (UTC) server has always emitted.
    ["2021-05-28T14:00:00.000-07:00", "May 28, 2021"],
    ["2021-05-28T20:00:00.000-07:00", "May 29, 2021"],
  ])("formats %s as %s in every timezone", (iso, expected) => {
    expect(formatPostDate(iso)).toBe(expected)
  })
})

describe("extractTweetId", () => {
  it.each([
    [
      "https://twitter.com/Altimor/status/1660725218925776896",
      "1660725218925776896",
    ],
    [
      "https://x.com/cramforce/status/1975656443954274780",
      "1975656443954274780",
    ],
    ["https://x.com/lifeof_jer/status/2048576568109527407?s=20", "2048576568109527407"],
    ["https://www.twitter.com/JustJake/status/1667492928758095872", "1667492928758095872"],
    ["https://twitter.com/jack/statuses/20", "20"],
  ])("extracts the tweet id from %s", (url, id) => {
    expect(extractTweetId(url)).toBe(id)
  })

  it.each([
    "https://twitter.com/paulgb",
    "https://x.com/resend",
    "https://twitter.com/i/lists/123456",
    "https://nitter.net/user/status/1660725218925776896",
    "https://railway.com/x.com/user/status/123",
    "https://x.community/user/status/123",
    "not a url",
  ])("returns null for %s", (url) => {
    expect(extractTweetId(url)).toBeNull()
  })
})
