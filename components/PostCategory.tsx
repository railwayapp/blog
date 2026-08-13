import React from "react"
import { cn } from "../utils"

type PostCategoryTone = "plum" | "gold" | "teal" | "blue" | "wine"

const categoryToTone: Record<string, PostCategoryTone> = {
  Engineering: "plum",
  "Scaling Railway": "plum",
  News: "gold",
  AI: "teal",
  Community: "teal",
  Guide: "blue",
  Company: "wine",
  "User Stories": "wine",
}

const getCategoryTone = (category: string): PostCategoryTone =>
  categoryToTone[category] ?? "plum"

export const PostCategory: React.FC<{
  category: string
  isCommunity: boolean
  className?: string
}> = ({ category, isCommunity, className }) => {
  const getPillClassName = () =>
    cn(
      "post-category-pill font-medium max-w-max text-xs px-2 py-[3px] rounded-[4px] tracking-[0.06em] uppercase",
      className
    )

  return (
    <div className="flex gap-2">
      <div
        className={getPillClassName()}
        data-category-tone={getCategoryTone(category)}
      >
        {category}
      </div>
      {isCommunity && (
        <div
          className={getPillClassName()}
          data-category-tone={getCategoryTone("Community")}
        >
          Community
        </div>
      )}
    </div>
  )
}
