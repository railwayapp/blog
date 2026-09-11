import { act, renderHook, waitFor } from "@testing-library/react"
import usePostHog from "@hooks/usePostHog"
import useFathom from "@hooks/useFathom"
import { setPreviewTransition } from "@lib/preview-tracking"
import * as Fathom from "fathom-client"
import posthog from "posthog-js"

const mockHandlers = new Map<string, Set<(...args: any[]) => void>>()
const mockEvents = {
  on: (name: string, fn: (...args: any[]) => void) => {
    if (!mockHandlers.has(name)) mockHandlers.set(name, new Set())
    mockHandlers.get(name)?.add(fn)
  },
  off: (name: string, fn: (...args: any[]) => void) =>
    mockHandlers.get(name)?.delete(fn),
}
jest.mock("next/router", () => ({
  __esModule: true,
  default: {
    get events() {
      return mockEvents
    },
  },
  useRouter: () => ({ events: mockEvents }),
}))
jest.mock("fathom-client", () => ({
  load: jest.fn(),
  trackPageview: jest.fn(),
}))
jest.mock("posthog-js", () => {
  const ph = {
    config: {
      disable_session_recording: false,
      autocapture: true,
      enable_heatmaps: true,
    },
    init: jest.fn((_key, config) => {
      Object.assign(ph.config, config)
      config.loaded(ph)
    }),
    set_config: jest.fn((config) => Object.assign(ph.config, config)),
    capture: jest.fn(),
    register: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
    get_session_id: () => "test-session",
  }
  return { __esModule: true, default: ph }
})
const emit = (name: string, ...args: any[]) =>
  mockHandlers.get(name)?.forEach((fn) => fn(...args))
const navigate = async (url: string) => {
  await act(async () => {
    emit("routeChangeStart", url)
    window.history.pushState({}, "", url)
    emit("routeChangeComplete", url)
  })
}
beforeEach(() => {
  mockHandlers.clear()
  jest.clearAllMocks()
  setPreviewTransition(false)
  window.history.replaceState({}, "", "/")
  Object.assign(posthog.config, {
    disable_session_recording: false,
    autocapture: true,
    enable_heatmaps: true,
  })
})
it("does not initialize analytics on previews and starts them after leaving", async () => {
  window.history.replaceState({}, "", "/p/draft?cmsPreview=secret")
  renderHook(() => {
    usePostHog()
    useFathom("test", "blog.railway.com")
  })
  await act(async () => {
    await Promise.resolve()
  })
  expect(posthog.init).not.toHaveBeenCalled()
  expect(Fathom.load).not.toHaveBeenCalled()
  await navigate("/p/public")
  await waitFor(() => expect(posthog.capture).toHaveBeenCalledTimes(1))
  expect(Fathom.trackPageview).toHaveBeenCalledTimes(1)
})
it("stops recording before entering a preview and resumes on a public page", async () => {
  renderHook(() => {
    usePostHog()
    useFathom("test", "blog.railway.com")
  })
  await waitFor(() => expect(posthog.capture).toHaveBeenCalledTimes(1))
  act(() => emit("routeChangeStart", "/p/draft?cmsPreview=secret"))
  expect(posthog.config.disable_session_recording).toBe(true)
  expect(posthog.config.autocapture).toBe(false)
  expect((posthog.config.before_send as any)({ properties: {} })).toBeNull()
  await navigate("/p/draft?cmsPreview=secret")
  expect(posthog.capture).toHaveBeenCalledTimes(1)
  expect(Fathom.trackPageview).toHaveBeenCalledTimes(1)
  await navigate("/p/public")
  expect(posthog.config.disable_session_recording).toBe(false)
  expect(posthog.config.autocapture).toBe(true)
  expect(posthog.capture).toHaveBeenCalledTimes(2)
  expect(Fathom.trackPageview).toHaveBeenCalledTimes(2)
})
