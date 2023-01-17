import { useTheme } from "next-themes"

export const useOgImage = ({
  title,
  authorName,
  image,
}: {
  title: string
  authorName: string
  image?: string
}): string => {
  const { theme } = useTheme()

  const encodedTitle = encodeURIComponent(title)
  const encodedAuthorName = encodeURIComponent(authorName)

  return (
    image ??
    `https://og.railway.app/api/image?fileType=png&layoutName=Blog&Theme=${
      theme === "light" ? "Light" : "Dark"
    }&Title=${encodedTitle}&Author=${encodedAuthorName}`
  )
}
