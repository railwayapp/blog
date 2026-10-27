/** @jest-environment node */
import { readFileSync } from "fs"
import { join } from "path"
import { buildSchema, parse, validate } from "graphql"

const schema = buildSchema(
  readFileSync(join(process.cwd(), "lib/cms/schema.graphql"), "utf8")
)

it.each(["posts.graphql", "update-post.graphql"])(
  "validates the SEO helper's %s against the committed CMS schema",
  (filename) => {
    const document = parse(
      readFileSync(join(process.cwd(), "scripts/seo", filename), "utf8")
    )
    expect(validate(schema, document).map((error) => error.message)).toEqual([])
  }
)
