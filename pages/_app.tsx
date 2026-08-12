import useFathom from "@hooks/useFathom"
import usePostHog from "@hooks/usePostHog"
import "@styles/globals.css"
import { ThemeProvider } from "next-themes"
import type { AppProps } from "next/app"
import { Inter, IBM_Plex_Serif, JetBrains_Mono } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})
const ibmPlexSerif = IBM_Plex_Serif({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
})
const jetBrainsMono = JetBrains_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
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
      <div
        className={`${inter.variable} ${ibmPlexSerif.variable} ${jetBrainsMono.variable} font-sans`}
      >
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  )
}

export default RailwayBlog
