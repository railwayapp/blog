import { BlogPost } from "@lib/types"

export interface GuideTopic {
  id: string
  label: string
  description: string
  match: RegExp
}

// The CMS has no topic field on posts, so guides are grouped by matching
// their title and description. Order matters: a guide's primary topic (the
// section it is listed under) is the first topic that matches it. Filters
// use every matching topic, so a guide can surface under more than one.
export const GUIDE_TOPICS: GuideTopic[] = [
  {
    id: "ai",
    label: "AI & agents",
    description: "Deploy AI apps, inference servers, and agentic workflows.",
    match: /\bAI\b|\bLLMs?\b|\bagent(ic|s)?\b|agent-native|\bMCP\b|inference/i,
  },
  {
    id: "databases",
    label: "Databases",
    description: "Host, back up, and scale Postgres, Redis, and more.",
    match:
      /postgres|redis|database|pgvector|backup|connection pooling|geolite/i,
  },
  {
    id: "jobs",
    label: "Cron & background jobs",
    description: "Scheduled tasks, queues, and long-running workers.",
    match: /\bcron\b|queues?\b|scheduled|recurring/i,
  },
  {
    id: "ci-cd",
    label: "CI/CD & workflows",
    description: "Pipelines, preview environments, monorepos, and GitOps.",
    match:
      /CI\/CD|continuous deployment|github actions|gitlab|gitops|preview environment|monorepo|\bNX\b|feature flags|testing suite|container registr/i,
  },
  {
    id: "migrations",
    label: "Migrating to Railway",
    description: "Move over from Heroku, AWS, Cloudflare, and others.",
    match: /migrat|heroku|alternatives/i,
  },
  {
    id: "observability",
    label: "Observability",
    description: "Logs, metrics, traces, and monitoring for your services.",
    match: /\blogs?\b|metrics|traces|observability|logging|analytics/i,
  },
  {
    id: "deploy",
    label: "Deploying apps",
    description: "Step-by-step guides for frameworks, languages, and tools.",
    match:
      /^deploy|deploying|^building|^use |hosting options|self-hosted|scaling a|optimi[sz]e deployments|full-stack|backends|node\.js|\bdart\b|nestjs|directus|ghost/i,
  },
  {
    id: "fundamentals",
    label: "Cloud fundamentals",
    description: "PaaS, serverless, BYOC, pricing, compliance, and more.",
    match:
      /paas|iaas|saas|byoc|serverless|kubernetes|compliance|secure|pricing|cloud|multi-region|secrets/i,
  },
]

export const OTHER_TOPIC: GuideTopic = {
  id: "other",
  label: "More guides",
  description: "Everything else worth reading.",
  match: /$^/,
}

const guideText = (post: BlogPost) => `${post.title}\n${post.description}`

// Titles are the strongest signal; descriptions only break ties so a guide
// that merely mentions "cloud" in passing is not filed as a fundamentals read.
export const getGuideTopics = (post: BlogPost): GuideTopic[] => {
  const byTitle = GUIDE_TOPICS.filter((topic) => topic.match.test(post.title))
  if (byTitle.length > 0) return byTitle

  const byText = GUIDE_TOPICS.filter((topic) =>
    topic.match.test(guideText(post))
  )
  return byText.length > 0 ? byText : [OTHER_TOPIC]
}

export const getPrimaryGuideTopic = (post: BlogPost): GuideTopic =>
  getGuideTopics(post)[0]

export interface GuideSection {
  topic: GuideTopic
  guides: BlogPost[]
}

// Sections keep the taxonomy order and drop topics without any guides.
export const groupGuidesByTopic = (guides: BlogPost[]): GuideSection[] => {
  const buckets = new Map<string, BlogPost[]>()

  for (const guide of guides) {
    const { id } = getPrimaryGuideTopic(guide)
    buckets.set(id, [...(buckets.get(id) ?? []), guide])
  }

  return [...GUIDE_TOPICS, OTHER_TOPIC]
    .map((topic) => ({ topic, guides: buckets.get(topic.id) ?? [] }))
    .filter((section) => section.guides.length > 0)
}

// Topic filter counts: a guide counts toward every topic it matches.
export const countGuidesByTopic = (guides: BlogPost[]) => {
  const counts = new Map<string, number>()

  for (const guide of guides) {
    for (const topic of getGuideTopics(guide)) {
      counts.set(topic.id, (counts.get(topic.id) ?? 0) + 1)
    }
  }

  return counts
}

export const getGuideTopicById = (id: string | null | undefined) =>
  [...GUIDE_TOPICS, OTHER_TOPIC].find((topic) => topic.id === id) ?? null

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")

// Every whitespace-separated term must appear in the title, description, or
// an author's name, so "postgres backup" narrows instead of widening.
export const filterGuides = (
  guides: BlogPost[],
  { query = "", topicId }: { query?: string; topicId?: string | null }
) => {
  const terms = normalize(query).split(/\s+/).filter(Boolean)

  return guides.filter((guide) => {
    if (
      topicId &&
      !getGuideTopics(guide).some((topic) => topic.id === topicId)
    ) {
      return false
    }

    if (terms.length === 0) return true

    const haystack = normalize(
      [
        guide.title,
        guide.description,
        ...guide.authors.map((author) => author.name),
      ].join(" ")
    )

    return terms.every((term) => haystack.includes(term))
  })
}
