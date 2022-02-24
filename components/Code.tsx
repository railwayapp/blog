import { useTheme } from "next-themes"
import React, { useState } from "react"
import { getHighlighter, setCDN } from "shiki"
import { useAsyncEffect } from "../hooks/useAsyncEffect"

setCDN("https://unpkg.com/shiki/")

const LIGHT_THEME = "light-plus"
const DARK_THEME = "one-dark-pro"

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
        theme: theme === "light" ? LIGHT_THEME : DARK_THEME,
      }).then((highlighter) =>
        highlighter.codeToHtml(children, { lang: language })
      )
    )
  }, [theme])

  if (markupToHighlight == null) {
    return (
      <pre>
        <code>{children}</code>
      </pre>
    )
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: markupToHighlight }}
      className="shiki-wrapper"
    />
  )
}
