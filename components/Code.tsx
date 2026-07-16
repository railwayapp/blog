import { useTheme } from "next-themes"
import React, { useState } from "react"
import { createHighlighter } from "shiki"
import { useAsyncEffect } from "../hooks/useAsyncEffect"


const LIGHT_THEME = "github-light"
const DARK_THEME = "github-dark-dimmed"

export const Code: React.FC<{ children: string; language?: string }> = ({
  children,
  language = "javascript",
}) => {
  const { theme } = useTheme()
  const [markupToHighlight, setMarkupToHighlight] = useState<string | null>(
    null
  )

  // The CMS editor's language picker writes display names into fences
  // ("TypeScript", "Shell"); shiki ids and aliases are all lowercase.
  const shikiLanguage = language.toLowerCase()

  useAsyncEffect(async () => {
    // Load just this block's grammar: any language shiki bundles works
    // (tsx, sql, diff, ...) and unknown languages reject, leaving the
    // plain <pre> fallback below.
    setMarkupToHighlight(
      await createHighlighter({
        langs: [shikiLanguage],
        themes: [theme === "light" ? LIGHT_THEME : DARK_THEME],
      }).then((highlighter) =>
        highlighter.codeToHtml(children, { lang: shikiLanguage, theme: theme === "light" ? LIGHT_THEME : DARK_THEME })
      )
    )
  }, [theme])
  

  // Show raw code if highlighting hasn't completed yet
  if (markupToHighlight == null) {
    return (
      <pre className="mb-6">
        <code>{children}</code>
      </pre>
    )
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: markupToHighlight }}
      className="shiki-wrapper mb-6"
    />
  )
}
