import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const extractYoutubeId = (url: string): string | null => {
  const matched = url.match(
    /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\\&\\?]*).*/
  )
  return matched && matched.length >= 1 ? matched[1] : null
}
