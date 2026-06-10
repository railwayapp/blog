export interface MarkdownSegment {
  content: string
  icon?: string
  type: "markdown" | "callout"
}

export interface TableOfContentsItem {
  id: string
  level: number
  text: string
}

export interface FAQItem {
  answer: string
  question: string
}

export interface MarkdownSlugger {
  slug: (value: string) => string
}

const ASIDE_PATTERN = /<aside>\s*([\s\S]*?)\s*<\/aside>/gi

const trimMarkdown = (value: string) => value.replace(/^\s+|\s+$/g, "")

const looksLikeCalloutIcon = (value: string) =>
  value.length > 0 && value.length <= 4 && !/[A-Za-z0-9]/.test(value)

const parseCallout = (content: string) => {
  const lines = trimMarkdown(content).split(/\r?\n/)
  const firstLine = lines[0]?.trim() ?? ""

  if (looksLikeCalloutIcon(firstLine)) {
    return {
      content: trimMarkdown(lines.slice(1).join("\n")),
      icon: firstLine,
    }
  }

  return {
    content: trimMarkdown(content),
    icon: undefined,
  }
}

export const segmentMarkdown = (content: string): MarkdownSegment[] => {
  const segments: MarkdownSegment[] = []
  let lastIndex = 0

  for (const match of content.matchAll(ASIDE_PATTERN)) {
    const index = match.index ?? 0
    const markdownBefore = trimMarkdown(content.slice(lastIndex, index))

    if (markdownBefore) {
      segments.push({ type: "markdown", content: markdownBefore })
    }

    const callout = parseCallout(match[1] ?? "")

    if (callout.content) {
      segments.push({ type: "callout", ...callout })
    }

    lastIndex = index + match[0].length
  }

  const markdownAfter = trimMarkdown(content.slice(lastIndex))

  if (markdownAfter) {
    segments.push({ type: "markdown", content: markdownAfter })
  }

  return segments
}

export const stripMarkdown = (content: string) =>
  content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    // Hyphens are only markdown when they are line-level markers (list
    // bullets, horizontal rules); anywhere else they are part of a word
    // ("pre-built", "PCI-DSS") and must survive.
    .replace(/^[ \t]*[-+*][ \t]+/gm, " ")
    .replace(/^[ \t]*-{3,}[ \t]*$/gm, " ")
    .replace(/[#>*_~|`]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const slugify = (content: string) => {
  const slug = stripMarkdown(content)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

  return slug || "section"
}

export const createMarkdownSlugger = (): MarkdownSlugger => {
  const seen = new Map<string, number>()

  return {
    slug: (value: string) => {
      const base = slugify(value)
      const count = seen.get(base) ?? 0
      seen.set(base, count + 1)

      return count === 0 ? base : `${base}-${count}`
    },
  }
}

export const getHeadingId = (text: string, slugger: MarkdownSlugger) =>
  slugger.slug(stripMarkdown(text))

export const extractTableOfContents = (
  content: string
): TableOfContentsItem[] => {
  const slugger = createMarkdownSlugger()
  const items: TableOfContentsItem[] = []

  for (const segment of segmentMarkdown(content)) {
    const lines = segment.content.split(/\r?\n/)

    for (const line of lines) {
      const match = line.match(/^(#{1,3})\s+(.+)$/)
      if (!match) continue

      const text = stripMarkdown(match[2])
      if (!text) continue

      items.push({
        id: getHeadingId(text, slugger),
        level: match[1].length,
        text,
      })
    }
  }

  return items
}

/**
 * Questions may only come from h2/h3 headings or callouts ending in "?";
 * body text can only ever answer a pending question. Letting arbitrary
 * paragraphs become questions turns rhetorical prose into fabricated
 * FAQPage structured data.
 */
export const extractFAQs = (content: string): FAQItem[] => {
  const faqs: FAQItem[] = []
  let currentQuestion: string | null = null

  const answerWith = (text: string) => {
    if (!currentQuestion) return

    const stripped = stripMarkdown(text)
    if (!stripped) return

    faqs.push({ question: currentQuestion, answer: stripped })
    currentQuestion = null
  }

  for (const segment of segmentMarkdown(content)) {
    if (segment.type === "callout") {
      // A callout maps to a Notion callout block: its first paragraph is the
      // callout's own text (a question candidate), any following paragraphs
      // were child blocks (answer material only).
      const [first, ...rest] = segment.content
        .split(/\n{2,}/)
        .map((chunk) => chunk.trim())
        .filter(Boolean)

      if (first) {
        const stripped = stripMarkdown(first)
        if (stripped.endsWith("?")) {
          currentQuestion = stripped
        } else {
          answerWith(first)
        }
      }

      for (const chunk of rest) {
        answerWith(chunk)
      }
      continue
    }

    const chunks = segment.content
      .split(/\n{2,}/)
      .map((chunk) => chunk.trim())
      .filter(Boolean)

    for (const chunk of chunks) {
      const heading = chunk.match(/^(#{1,3})\s+(.+)$/)

      if (heading) {
        const stripped = stripMarkdown(heading[2])
        if (heading[1].length >= 2 && stripped.endsWith("?")) {
          currentQuestion = stripped
        }
        continue
      }

      answerWith(chunk)
    }
  }

  return faqs
}
