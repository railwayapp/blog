import { useTheme } from "next-themes"

export const useOgImage = ({
  title,
  authorName,
}: {
  title: string
  authorName: string
}): string => {
  const { theme } = useTheme()
  return `https://og.railway.app/api/image?fileType=png&layoutName=Blog&Theme=${
    theme === "light" ? "Light" : "Dark"
  }&Title=${title}&Author=${authorName}`
}
