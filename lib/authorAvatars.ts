const AUTHOR_AVATAR_FALLBACKS: Record<string, string> = {
  "Victor Ramirez":
    "https://res.cloudinary.com/railway/image/upload/v1775568891/blog/victor_headshot_fo4zlp.jpg",
}

export function getAuthorAvatarUrl(author: {
  name: string
  avatar_url: string | null
}): string {
  return (
    author.avatar_url || AUTHOR_AVATAR_FALLBACKS[author.name] || "/default-avatar.svg"
  )
}
