import React from "react"
import { cn } from "../utils"

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
      <div className={getPillClassName()}>{category}</div>
      {isCommunity && <div className={getPillClassName()}>Community</div>}
    </div>
  )
}
