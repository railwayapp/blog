import { ClassValue, clsx } from "clsx"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { twMerge } from "tailwind-merge"

dayjs.extend(utc)

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

// CMS publish dates are ISO timestamps (usually midnight UTC). Format them in
// UTC so the server and every visitor's browser agree on the calendar day;
// local-time formatting shifts the date west of UTC and breaks hydration.
export const formatPostDate = (isoDate: string): string =>
  dayjs.utc(isoDate).format("MMM D, YYYY")

export const extractYoutubeId = (url: string): string | null => {
  const matched = url.match(
    /^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{6,})/
  )
  return matched?.[1] ?? null
}

export const extractTweetId = (url: string): string | null => {
  const matched = url.match(
    /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[A-Za-z0-9_]+\/status(?:es)?\/(\d+)/
  )
  return matched?.[1] ?? null
}
