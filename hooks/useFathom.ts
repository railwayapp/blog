import * as Fathom from "fathom-client"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { hasPreviewURL, isContentPreview } from "@lib/preview-tracking"

const useFathom = (trackingCode: string, siteUrl: string) => {
  const router = useRouter()

  useEffect(() => {
    let loaded = false
    const onRouteChangeComplete = (destination?: string) => {
      if (hasPreviewURL(destination) || isContentPreview()) return
      if (!loaded) {
        Fathom.load(trackingCode, { includedDomains: [siteUrl], auto: false })
        loaded = true
      }
      Fathom.trackPageview({
        url: window.location.href,
        referrer: hasPreviewURL(document.referrer) ? "" : document.referrer,
      })
    }
    onRouteChangeComplete()
    // Record a pageview when route changes
    router.events.on("routeChangeComplete", onRouteChangeComplete)

    // Unassign event listener
    return () => {
      router.events.off("routeChangeComplete", onRouteChangeComplete)
    }
  }, [router.events, trackingCode, siteUrl])
}

export default useFathom
