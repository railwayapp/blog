import * as Fathom from "fathom-client"
import { useRouter } from "next/router"
import { useEffect } from "react"

const useFathom = (trackingCode: string, siteUrl: string) => {
  const router = useRouter()

  useEffect(() => {
    // Initialize Fathom when the app loads
    Fathom.load(trackingCode, {
      includedDomains: [siteUrl],
    })

    const onRouteChangeComplete = () => {
      Fathom.trackPageview()
    }
    // Record a pageview when route changes
    router.events.on("routeChangeComplete", onRouteChangeComplete)

    // Unassign event listener
    return () => {
      router.events.off("routeChangeComplete", onRouteChangeComplete)
    }
  }, [])
}

export default useFathom
