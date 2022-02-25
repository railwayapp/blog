import useFathom from "@hooks/useFathom"
import "@styles/globals.css"
import { ThemeProvider } from "next-themes"
import type { AppProps } from "next/app"
import Head from "next/head"
import { useMemo } from "react"
import { transformThemeToCustomProperties } from "theme-custom-properties"
import { colorThemes, defaultColorMode } from "../styles/theme"

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
      defaultTheme="light"
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
