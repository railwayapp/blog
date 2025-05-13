import posthog from "posthog-js"
import { useEffect } from "react"
import Router from "next/router"

// Key for storing session ID in localStorage
const POSTHOG_SESSION_ID_KEY = "railway_posthog_session_id"

/**
 * Gets or creates a session ID for PostHog tracking
 * @returns The session ID
 */
const getOrCreateSessionId = (): string => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") return ""

  // Check if we already have a session ID in localStorage
  let sessionId = localStorage.getItem(POSTHOG_SESSION_ID_KEY)

  // If not, get it from PostHog or generate a new one
  if (!sessionId && posthog && typeof posthog.get_session_id === "function") {
    sessionId = posthog.get_session_id()
    if (sessionId) {
      localStorage.setItem(POSTHOG_SESSION_ID_KEY, sessionId)
    }
  }

  // Register the session ID with PostHog
  if (sessionId && posthog && typeof posthog.register === "function") {
    posthog.register({
      sessionId: sessionId,
    })

    console.log("Blog Session ID", sessionId)
  }

  return sessionId || ""
}

/**
 * Identifies a user in PostHog
 * @param id User ID
 * @param traits Additional user properties
 */
const identifyInPostHog = (id: string, traits?: Record<string, any>): void => {
  if (posthog && typeof posthog.identify === "function") {
    posthog.identify(id, traits)
  }
}

/**
 * Resets the PostHog user
 */
const resetPostHog = (): void => {
  if (posthog && typeof posthog.reset === "function") {
    posthog.reset()
  }
}

/**
 * Custom hook for PostHog analytics integration
 * @returns Object with identify and reset functions
 */
const usePostHog = () => {
  useEffect(() => {
    // Skip PostHog initialization in development
    if (process.env.NODE_ENV === "development") {
      return
    }

    // Skip if we're not in a browser environment
    if (typeof window === "undefined") {
      return
    }

    // Check if PostHog is already initialized by checking if specific methods exist
    const isPostHogInitialized =
      typeof (posthog as any).persistence?.get_sessionid === "function" ||
      typeof (posthog as any)._send_request === "function"

    if (!isPostHogInitialized) {
      posthog.init("phc_jmpOAF1fCA4XG8D6zO8AuihY1JHmOkvzqtg5cZoxeJb", {
        api_host: "https://lantern.railway.com",
        loaded: (posthogInstance) => {
          // After PostHog is loaded, ensure we have a session ID
          const sessionId = posthogInstance.get_session_id()

          if (sessionId) {
            // Store in our persistent storage
            localStorage.setItem(POSTHOG_SESSION_ID_KEY, sessionId)

            // Register with PostHog to include with all events
            posthogInstance.register({
              sessionId: sessionId,
            })
          }
        },
      })
    } else {
      // PostHog is already loaded, make sure we have the session ID
      getOrCreateSessionId()
    }

    const handleRouteChange = () => {
      if (posthog && typeof posthog.capture === "function") {
        posthog.capture("$pageview")
      }
    }
    Router.events.on("routeChangeComplete", handleRouteChange)

    return () => {
      Router.events.off("routeChangeComplete", handleRouteChange)
    }
  }, [])

  return { identify: identifyInPostHog, reset: resetPostHog }
}

export default usePostHog
