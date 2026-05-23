import { useEffect, useRef } from "react"
import Router from "next/router"
import type { PostHog } from "posthog-js"

const POSTHOG_SESSION_ID_KEY = "railway_posthog_session_id"
const POSTHOG_DOMAIN = process.env.NEXT_PUBLIC_POSTHOG_PUBLIC_DOMAIN ?? ""
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_PUBLIC_KEY ?? ""

const usePostHog = () => {
  const posthogRef = useRef<PostHog | null>(null)

  useEffect(() => {
    // if (process.env.NODE_ENV === "development") return
    if (typeof window === "undefined") return

    let cancelled = false
    let handleRouteChange: (() => void) | null = null

    const load = () => import("posthog-js").then(({ default: posthog }) => {
      if (cancelled) return
      posthogRef.current = posthog

      const isInitialized =
        typeof (posthog as any).persistence?.get_sessionid === "function" ||
        typeof (posthog as any)._send_request === "function"

      if (!isInitialized) {
        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_DOMAIN,
          advanced_disable_decide: true,
          loaded: (ph) => {
            const sessionId = ph.get_session_id()
            if (sessionId) {
              localStorage.setItem(POSTHOG_SESSION_ID_KEY, sessionId)
              ph.register({ sessionId })
            }
          },
        })
      } else {
        const sessionId =
          localStorage.getItem(POSTHOG_SESSION_ID_KEY) ||
          posthog.get_session_id()
        if (sessionId) {
          localStorage.setItem(POSTHOG_SESSION_ID_KEY, sessionId)
          posthog.register({ sessionId })
        }
      }

      handleRouteChange = () => posthog.capture("$pageview")
      Router.events.on("routeChangeComplete", handleRouteChange)
    })

    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(load)
    } else {
      setTimeout(load, 0)
    }

    return () => {
      cancelled = true
      if (handleRouteChange) {
        Router.events.off("routeChangeComplete", handleRouteChange)
      }
    }
  }, [])

  return {
    identify: (id: string, traits?: Record<string, any>) =>
      posthogRef.current?.identify(id, traits),
    reset: () => posthogRef.current?.reset(),
  }
}

export default usePostHog
