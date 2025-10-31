import useFathom from "@hooks/useFathom"
import usePostHog from "@hooks/usePostHog"
import "@styles/globals.css"
import { ThemeProvider } from "next-themes"
import type { AppProps } from "next/app"
import Head from "next/head"
import { Inter } from "@next/font/google"

const inter = Inter({ subsets: ["latin"] })

const RailwayBlog = ({ Component, pageProps }: AppProps) => {
  useFathom(process.env.NEXT_PUBLIC_FATHOM_CODE ?? "", "blog.railway.com")
  usePostHog()

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange={true}
      enableSystem
    >
      <Head>
        <style jsx global>{`
          html {
            font-family: ${inter.style.fontFamily};
          }
        `}</style>
      </Head>

      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default RailwayBlog
