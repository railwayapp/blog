import type { AppProps } from "next/app"
import useFathom from "@hooks/useFathom"
import { ThemeProvider } from "next-themes"

import "@styles/globals.css"
import { useMemo } from "react"
import { transformThemeToCustomProperties } from "theme-custom-properties"
import { colorThemes, defaultColorMode } from "../styles/theme"
import Head from "next/head"

const RailwayBlog = ({ Component, pageProps }: AppProps) => {
  useFathom(process.env.NEXT_PUBLIC_FATHOM_CODE ?? "", "blog.railway.app")

  const { bodyCSS } = useMemo(
    () =>
      transformThemeToCustomProperties(colorThemes, {
        defaultTheme: defaultColorMode,
        attribute: "class",
      }),
    []
  )

  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange={true}
      enableSystem
    >
      <Head>
        <style>{bodyCSS}</style>
      </Head>

      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default RailwayBlog
