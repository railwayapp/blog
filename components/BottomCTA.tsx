import React from "react"
import Link from "./Link"

export const BottomCTA: React.FC = () => {
  return (
    <section
      className="post-bottom-cta my-16 border rounded-[16px] px-6 py-16 sm:px-12 sm:py-24 flex flex-col items-center justify-center text-center"
      aria-labelledby="post-bottom-cta-title"
    >
      <h3 id="post-bottom-cta-title" className="text-h2 font-serif font-medium">
        Ready to get started?
      </h3>
      <p className="mt-4 text-base sm:text-lg text-gray-600">
        Join millions of developers deploying applications on Railway
      </p>
      <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row">
        <Link
          href="https://dev.new"
          className="post-bottom-cta-primary inline-flex min-h-[48px] items-center justify-center rounded-[8px] px-6 py-3 text-base font-medium no-underline transition-colors duration-100"
        >
          Deploy a new project
        </Link>
        <Link
          href="https://railway.com/enterprise"
          className="post-bottom-cta-secondary inline-flex min-h-[48px] items-center justify-center rounded-[8px] border px-6 py-3 text-base font-medium no-underline transition-colors duration-100"
        >
          Book a demo
        </Link>
      </div>
    </section>
  )
}
