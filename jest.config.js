const nextJest = require("next/jest")

const createJestConfig = nextJest({
  dir: "./",
})

const customJestConfig = {
  roots: ["<rootDir>"],
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "tsx", "js", "json", "jsx"],
  testPathIgnorePatterns: ["<rootDir>[/\\\\](node_modules|.next)[/\\\\]"],
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\]"],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "\\.(gif|ttf|eot|svg|png)$": "<rootDir>/test/__mocks__/fileMock.js",
    "@components/(.*)": "<rootDir>/components/$1",
    "@layouts/(.*)": "<rootDir>/layouts/$1",
    "@lib/(.*)": "<rootDir>/lib/$1",
    "@hooks/(.*)": "<rootDir>/hooks/$1",
    "@styles/(.*)": "<rootDir>/styles/$1",
  },
}

module.exports = createJestConfig(customJestConfig)
