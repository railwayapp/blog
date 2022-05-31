import { useTheme } from "next-themes"

export const useOgImage = ({
  title,
  authorName,
}: {
  title: string
  authorName: string
}): string => {
  const { theme } = useTheme()

  const encodedTitle = encodeURIComponent(title)
  const encodedAuthorName = encodeURIComponent(authorName)

  return `https://og.railway.app/api/image?fileType=png&layoutName=Blog&Theme=${
    theme === "light" ? "Light" : "Dark"
  }&Title=${encodedTitle}&Author=${encodedAuthorName}`
}
