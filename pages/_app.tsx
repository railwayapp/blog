import useFathom from "@hooks/useFathom"
import usePostHog from "@hooks/usePostHog"
import "@styles/globals.css"
import { ThemeProvider } from "next-themes"
import type { AppProps } from "next/app"
import Head from "next/head"
import { Inter, IBM_Plex_Serif } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })
const ibmPlexSerif = IBM_Plex_Serif({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
})

const RailwayBlog = ({ Component, pageProps }: AppProps) => {
  useFathom(process.env.NEXT_PUBLIC_FATHOM_CODE ?? "", "blog.railway.com")
  usePostHog()

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
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

      <div className={ibmPlexSerif.variable}>
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  )
}

export default RailwayBlog
