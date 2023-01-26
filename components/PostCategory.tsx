import React from "react"

const categoryToStyle = {
  News: "text-blue-500 bg-blue-50",
  Guide: "text-green-500 bg-green-50",
  Company: "text-pink-500 bg-pink-50",
  Engineering: "text-pink-500 bg-pink-50",
  "User Stories": "text-pink-500 bg-pink-50",
  "Scaling Railway": "text-green-500 bg-green-50",
}

export const PostCategory: React.FC<{
  category: string
  className?: string
}> = ({ category, className }) => {
  return (
    <div
      className={`${
        categoryToStyle[category] ?? "text-gray-500 bg-gray-50"
      } font-bold px-1.5 py-1 rounded max-w-max text-xs uppercase ${className}`}
    >
      {category}
    </div>
  )
}
