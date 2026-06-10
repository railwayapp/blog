import { serializeSchema } from "@components/Seo"

describe("serializeSchema", () => {
  it("escapes < so CMS strings cannot close the JSON-LD script tag", () => {
    const schema = {
      "@type": "BlogPosting",
      headline: 'Evil</script><script>alert("xss")</script>',
    }

    const out = serializeSchema(schema)

    expect(out).not.toContain("</script>")
    expect(out).not.toContain("<")
  })

  it("round-trips to identical JSON for crawlers", () => {
    const schema = {
      headline: "</script> & <b>bold</b>",
      answer: "1 < 2 > 0",
    }

    expect(JSON.parse(serializeSchema(schema))).toEqual(schema)
  })

  it("leaves ordinary schemas byte-identical to JSON.stringify", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: "Scaling Railway",
      datePublished: "2026-06-04T00:00:00.000Z",
    }

    expect(serializeSchema(schema)).toBe(JSON.stringify(schema))
  })
})
