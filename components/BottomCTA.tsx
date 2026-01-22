import React from "react"
import { cn } from "../utils"
import Link from "./Link"

export const BottomCTA: React.FC = () => {
  return (
    <div
      className={cn(
        "bg-bottomCta my-16 p-16 text-white rounded-xl flex flex-col items-center justify-center"
      )}
    >
      <h3 className={cn("text-[40px] mb-4 font-bold")}>
        Your train has arrived!
      </h3>
      <p className={cn("text-xl text-center max-w-xl text-opacity-90")}>
        Join millions of developers deploying millions of applications
        effortlessly on Railway.
      </p>
      <Link
        href="https://dev.new"
        className={cn(
          "no-underline bg-white text-pink-500 py-3 px-5 rounded-lg mt-8 font-semibold text-xl"
        )}
      >
        Start a New Project
      </Link>
    </div>
  )
}
