const nextJest = require("next/jest")

const createJestConfig = nextJest({
  dir: "./",
})

const customJestConfig = {
  roots: ["<rootDir>"],
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "tsx", "js", "json", "jsx"],
  testPathIgnorePatterns: ["<rootDir>[/\\\\](node_modules|.next)[/\\\\]"],
  // react-markdown and the unified/remark/rehype ecosystem ship ESM-only and
  // must be transformed for Jest.
  transformIgnorePatterns: [
    "[/\\\\]node_modules[/\\\\](?!(react-markdown|remark-[^/\\\\]+|rehype-[^/\\\\]+|micromark[^/\\\\]*|mdast-[^/\\\\]+|hast-[^/\\\\]+|hastscript|unist-[^/\\\\]+|unified|vfile[^/\\\\]*|bail|trough|is-plain-obj|devlop|zwitch|ccount|longest-streak|markdown-table|escape-string-regexp|decode-named-character-reference|character-entities[^/\\\\]*|character-reference-invalid|property-information|space-separated-tokens|comma-separated-tokens|html-url-attributes|trim-lines|web-namespaces|estree-util-[^/\\\\]+|html-void-elements|stringify-entities)[/\\\\])",
  ],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  moduleNameMapper: {
    // Jest cannot resolve these packages' conditional export/imports maps.
    "^unist-util-visit-parents/do-not-use-color$":
      "<rootDir>/node_modules/unist-util-visit-parents/lib/color.node.js",
    "^#minpath$": "<rootDir>/node_modules/vfile/lib/minpath.browser.js",
    "^#minproc$": "<rootDir>/node_modules/vfile/lib/minproc.browser.js",
    "^#minurl$": "<rootDir>/node_modules/vfile/lib/minurl.browser.js",
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "\\.(gif|ttf|eot|svg|png)$": "<rootDir>/test/__mocks__/fileMock.js",
    "@components/(.*)": "<rootDir>/components/$1",
    "@layouts/(.*)": "<rootDir>/layouts/$1",
    "@lib/(.*)": "<rootDir>/lib/$1",
    "@hooks/(.*)": "<rootDir>/hooks/$1",
    "@styles/(.*)": "<rootDir>/styles/$1",
  },
}

const buildConfig = createJestConfig(customJestConfig)

module.exports = async () => {
  const config = await buildConfig()

  // next/jest unconditionally prepends its own node_modules patterns, which
  // would override the ESM allowlist above; our own pattern (written with
  // "[/\\\\]" so it doesn't match the prefix below) still ignores everything else.
  config.transformIgnorePatterns = (config.transformIgnorePatterns ?? []).filter(
    (pattern) => !pattern.startsWith("/node_modules/")
  )

  return config
}
