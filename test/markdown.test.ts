import {
  extractFAQs,
  extractTableOfContents,
  stripMarkdown,
} from "../lib/markdown"

describe("extractFAQs", () => {
  it("pairs a question heading with the following paragraph", () => {
    const faqs = extractFAQs(
      "## What is Railway?\n\nRailway is a deployment platform.\n\n### How do I deploy?\n\nRun `railway up`."
    )
    expect(faqs).toEqual([
      { question: "What is Railway?", answer: "Railway is a deployment platform." },
      { question: "How do I deploy?", answer: "Run railway up." },
    ])
  })

  // Regression: arbitrary prose ending in "?" must NOT become an FAQ question.
  it("ignores rhetorical paragraphs ending in a question mark", () => {
    const faqs = extractFAQs(
      "We could stop here. Sound good?\n\nWell, not quite — there is more to do."
    )
    expect(faqs).toEqual([])
  })

  it("does not let a question-shaped paragraph open an FAQ after prose", () => {
    const faqs = extractFAQs(
      "Want to share your project as a template for other Railway users?\n\nHead to the template marketplace."
    )
    expect(faqs).toEqual([])
  })

  it("pairs a question callout with the next text", () => {
    const faqs = extractFAQs(
      "<aside>\n💡\n\nDoes Railway support cron?\n</aside>\n\nYes, natively."
    )
    expect(faqs).toEqual([
      { question: "Does Railway support cron?", answer: "Yes, natively." },
    ])
  })

  it("pairs a question and answer inside a multi-paragraph callout", () => {
    const faqs = extractFAQs(
      "<aside>\n❔\n\n**Why not use Postgres for everything?**\n\nRedis is much faster for this.\n</aside>"
    )
    expect(faqs).toEqual([
      {
        question: "Why not use Postgres for everything?",
        answer: "Redis is much faster for this.",
      },
    ])
  })

  it("lets a callout answer a pending question", () => {
    const faqs = extractFAQs(
      "## Is my data safe?\n\n<aside>\n💡\n\nBackups run nightly.\n</aside>"
    )
    expect(faqs).toEqual([
      { question: "Is my data safe?", answer: "Backups run nightly." },
    ])
  })

  it("treats a question-ending paragraph after a question heading as the answer", () => {
    const faqs = extractFAQs(
      "## What changed?\n\nQuite a lot, wouldn't you say?\n\nMore prose."
    )
    expect(faqs).toEqual([
      { question: "What changed?", answer: "Quite a lot, wouldn't you say?" },
    ])
  })

  it("keeps a question pending across a non-question heading", () => {
    const faqs = extractFAQs("## Why migrate?\n\n## Background\n\nBecause it is faster.")
    expect(faqs).toEqual([
      { question: "Why migrate?", answer: "Because it is faster." },
    ])
  })

  it("ignores h1 headings as question sources", () => {
    const faqs = extractFAQs("# Really, an h1 question?\n\nSome text.")
    expect(faqs).toEqual([])
  })

  it("skips code blocks when looking for an answer", () => {
    const faqs = extractFAQs(
      "## How do I start?\n\n```bash\nrailway up\n```\n\nRun the CLI from your project."
    )
    expect(faqs).toEqual([
      { question: "How do I start?", answer: "Run the CLI from your project." },
    ])
  })

  it("preserves hyphenated compound words in questions and answers", () => {
    const faqs = extractFAQs(
      "## Why use pre-built images?\n\nThey keep PCI-DSS audits self-contained."
    )
    expect(faqs).toEqual([
      {
        question: "Why use pre-built images?",
        answer: "They keep PCI-DSS audits self-contained.",
      },
    ])
  })
})

describe("stripMarkdown", () => {
  it("keeps mid-word hyphens while stripping list markers and rules", () => {
    expect(
      stripMarkdown("- re-deploy the app\n- roll back\n\n---\n\nMulti-region setups")
    ).toBe("re-deploy the app roll back Multi-region setups")
  })

  it("does not treat negative numbers as list markers", () => {
    expect(stripMarkdown("-40C is cold")).toBe("-40C is cold")
  })
})

describe("extractTableOfContents", () => {
  // Anchor ids must match the pre-CMS Notion renderer exactly — they are
  // what Google and existing deep links have indexed: lowercase, whitespace
  // to "-", drop only "?!:", keep all other punctuation.
  it("generates the same anchor ids as the old Notion renderer", () => {
    const toc = extractTableOfContents(
      [
        "## Multi-region deployments",
        "",
        "### What's next",
        "",
        "## Goodbye Ansible, Hello `hikari-keeper`",
        "",
        "## Case 2: Framework preset (SSG)",
        "",
        "## **Why Work at Railway?**",
      ].join("\n")
    )
    expect(toc.map((item) => item.id)).toEqual([
      "multi-region-deployments",
      "what's-next",
      "goodbye-ansible,-hello-hikari-keeper",
      "case-2-framework-preset-(ssg)",
      "why-work-at-railway",
    ])
    expect(toc.map((item) => item.text)).toEqual([
      "Multi-region deployments",
      "What's next",
      "Goodbye Ansible, Hello hikari-keeper",
      "Case 2: Framework preset (SSG)",
      "Why Work at Railway?",
    ])
  })

  it("suffixes repeated headings so anchors stay unique", () => {
    const toc = extractTableOfContents(
      "## General procedure\n\ntext\n\n## General procedure\n\nmore"
    )
    expect(toc.map((item) => item.id)).toEqual([
      "general-procedure",
      "general-procedure-1",
    ])
  })

  it("ignores comment lines inside fenced code blocks", () => {
    const toc = extractTableOfContents(
      "## Real heading\n\n```bash\n# install dependencies\nyarn install\n```"
    )
    expect(toc.map((item) => item.id)).toEqual(["real-heading"])
  })
})
