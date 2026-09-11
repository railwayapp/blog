import { useEffect, useRef } from "react"
import Router from "next/router"
import type { PostHog } from "posthog-js"
import {
  filterPreviewEvent,
  hasPreviewURL,
  isContentPreview,
  setPreviewTransition,
} from "@lib/preview-tracking"

const POSTHOG_SESSION_ID_KEY = "railway_posthog_session_id"
const POSTHOG_DOMAIN = process.env.NEXT_PUBLIC_POSTHOG_PUBLIC_DOMAIN ?? ""
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_PUBLIC_KEY ?? ""

const usePostHog = () => {
  const posthogRef = useRef<PostHog | null>(null)

  useEffect(() => {
    let cancelled = false
    let recordingSettings: Pick<
      PostHog["config"],
      "disable_session_recording" | "autocapture" | "enable_heatmaps"
    > | null = null
    const syncRecording = () => {
      const ph = posthogRef.current
      if (!ph) return
      if (isContentPreview()) {
        if (recordingSettings) return
        recordingSettings = {
          disable_session_recording: ph.config.disable_session_recording,
          autocapture: ph.config.autocapture,
          enable_heatmaps: ph.config.enable_heatmaps,
        }
        ph.set_config({
          disable_session_recording: true,
          autocapture: false,
          enable_heatmaps: false,
        })
      } else if (recordingSettings) {
        ph.set_config(recordingSettings)
        recordingSettings = null
      }
    }

    const trackPublicPage = async () => {
      if (cancelled || isContentPreview()) return
      const { default: ph } = await import("posthog-js")
      if (cancelled || isContentPreview()) return
      if (!posthogRef.current) {
        posthogRef.current = ph
        ph.init(POSTHOG_KEY, {
          api_host: POSTHOG_DOMAIN,
          advanced_disable_decide: true,
          capture_pageview: false,
          capture_pageleave: false,
          before_send: filterPreviewEvent,
          loaded: (instance) => {
            syncRecording()
            if (isContentPreview()) return
            const sessionId = instance.get_session_id()
            if (sessionId) {
              localStorage.setItem(POSTHOG_SESSION_ID_KEY, sessionId)
              instance.register({ sessionId })
            }
          },
        })
      }
      syncRecording()
      ph.capture("$pageview")
    }
    const start = (destination: string) => {
      setPreviewTransition(hasPreviewURL(destination))
      syncRecording()
    }
    const complete = () => {
      setPreviewTransition(false)
      syncRecording()
      void trackPublicPage()
    }
    const failed = () => {
      setPreviewTransition(false)
      syncRecording()
    }
    Router.events.on("routeChangeStart", start)
    Router.events.on("routeChangeComplete", complete)
    Router.events.on("routeChangeError", failed)
    void trackPublicPage()
    return () => {
      cancelled = true
      setPreviewTransition(false)
      Router.events.off("routeChangeStart", start)
      Router.events.off("routeChangeComplete", complete)
      Router.events.off("routeChangeError", failed)
    }
  }, [])

  return {
    identify: (id: string, traits?: Record<string, unknown>) => {
      if (!isContentPreview()) posthogRef.current?.identify(id, traits)
    },
    reset: () => {
      if (!isContentPreview()) posthogRef.current?.reset()
    },
  }
}

export default usePostHog
