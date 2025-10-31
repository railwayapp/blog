// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document"
import { transformThemeToCustomProperties } from "theme-custom-properties"
import { colorThemes, defaultColorMode } from "../styles/theme"

export default function Document() {
  const { bodyCSS } = transformThemeToCustomProperties(colorThemes, {
    defaultTheme: defaultColorMode,
    attribute: "class",
  })

  return (
    <Html>
      <Head>
        <style dangerouslySetInnerHTML={{ __html: bodyCSS }} />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
