import React from "react"
import { cn } from "../utils"

const categoryToStyle = {
  News: "text-blue-500 bg-blue-50",
  Guide: "text-green-500 bg-green-50",
  Company: "text-pink-500 bg-pink-50",
  Engineering: "text-pink-500 bg-pink-50",
  Community: "text-green-500 bg-green-50",
  "User Stories": "text-pink-500 bg-pink-50",
  "Scaling Railway": "text-green-500 bg-green-50",
}

export const PostCategory: React.FC<{
  category: string
  isCommunity: boolean
  className?: string
}> = ({ category, isCommunity, className }) => {
  const getPillClassName = (pillCategory: string) =>
    cn(
      categoryToStyle[pillCategory] ?? "text-gray-600 bg-gray-50",
      "post-category-pill font-medium max-w-max text-xs px-2 py-[3px] rounded-[4px] tracking-[0.06em] uppercase",
      className
    )

  return (
    <div className="flex gap-2">
      <div className={getPillClassName(category)}>
        {category}
      </div>
      {isCommunity && (
        <div className={getPillClassName("Community")}>
          Community
        </div>
      )}
    </div>
  )
}
