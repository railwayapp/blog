import { useTheme } from "next-themes"
import React, { useState } from "react"
import { getHighlighter, setCDN } from "shiki"
import { useAsyncEffect } from "../hooks/useAsyncEffect"

setCDN("https://unpkg.com/shiki/")

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

  useAsyncEffect(async () => {
    setMarkupToHighlight(
      await getHighlighter({
        langs: ["html", "javascript", "typescript", "shell"],
        theme: theme === "light" ? LIGHT_THEME : DARK_THEME,
      }).then((highlighter) =>
        highlighter.codeToHtml(children, { lang: language })
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
