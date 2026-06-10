import { extractYoutubeId } from "../utils"

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
