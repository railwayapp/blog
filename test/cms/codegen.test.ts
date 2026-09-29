/** @jest-environment node */
import { spawnSync } from "child_process"
import {
  copyFileSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "fs"
import { tmpdir } from "os"
import { join } from "path"

let fixture: string
const runCheck = () => {
  const env = { ...process.env }
  delete env.CMS_API_KEY
  delete env.CMS_API_URL
  // The CLI suppresses validation diagnostics when NODE_ENV is "test".
  delete env.NODE_ENV
  return spawnSync(
    process.execPath,
    [
      join(fixture, "node_modules/@graphql-codegen/cli/esm/bin.js"),
      "--config",
      "codegen.yml",
      "--check",
    ],
    { cwd: fixture, encoding: "utf8", stdio: "pipe", env }
  )
}

beforeEach(() => {
  fixture = mkdtempSync(join(tmpdir(), "blog-cms-codegen-"))
  mkdirSync(join(fixture, "lib/cms"), { recursive: true })
  symlinkSync(
    join(process.cwd(), "node_modules"),
    join(fixture, "node_modules"),
    "dir"
  )
  for (const file of [
    "codegen.yml",
    "lib/cms/operations.graphql",
    "lib/cms/schema.graphql",
  ])
    copyFileSync(join(process.cwd(), file), join(fixture, file))
  cpSync(
    join(process.cwd(), "lib/cms/generated"),
    join(fixture, "lib/cms/generated"),
    { recursive: true }
  )
})
afterEach(() => rmSync(fixture, { recursive: true, force: true }))

it("validates committed contracts without a CMS checkout or credentials", () => {
  expect(runCheck().status).toBe(0)
})

it("rejects a field absent from the schema", () => {
  const path = join(fixture, "lib/cms/operations.graphql")
  writeFileSync(
    path,
    readFileSync(path, "utf8").replace("mimeType", "unknownCMSField")
  )
  const check = runCheck()
  expect(check.status).toBe(1)
  expect(check.stdout + check.stderr).toContain(
    'Cannot query field "unknownCMSField"'
  )
})

it("rejects stale generated code without rewriting it", () => {
  const path = join(fixture, "lib/cms/generated/graphql.ts")
  writeFileSync(path, "// stale contract\n")
  const check = runCheck()
  expect(check.status).toBe(1)
  expect(check.stdout + check.stderr).toContain("stale")
  expect(readFileSync(path, "utf8")).toBe("// stale contract\n")
})
