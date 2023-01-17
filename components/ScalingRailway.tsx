import React from "react"
import { cn } from "../utils"
import Link from "./Link"
import { Blob } from "./Blob"
import { useTheme } from "next-themes"
import { useIsMounted } from "../hooks/useIsMounted"

export const ScalingRailway: React.FC = () => {
  return (
    <div
      className={cn("relative -mx-5 md:-mx-8 px-5 md:px-8 pt-20 pb-24")}
      style={{
        background:
          "linear-gradient(155.36deg, var(--secondaryBg) 14.3%, var(--background) 82.49%)",
      }}
    >
      <div className="absolute top-0 pointer-events-none">
        <Blob />
      </div>

      <header className="max-w-6xl mx-auto mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-[42px] font-bold mb-3">Scaling Railway</h1>
          <p className="text-lg text-gray-600">
            Learn how we keep the train going, on-time, and fire-free.
          </p>
        </div>

        <Link
          href="/scaling-railway"
          className="md:col-span-2 text-center text-pink-700 border border-pink-200 rounded-md px-4 py-2 hover:text-pink-800 hover:border-pink-500 transition-colors duration-100"
        >
          All Scaling Railway Posts →
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <ScalingRailwayPostItem
          title="Roadmap"
          desc="Brief description about this blog post of the series."
          number="01"
          slug={"/p/scaling-railway-roadmap"}
          colour={"#6C6CD8"}
          image="artwork-roadmap"
        />

        <ScalingRailwayPostItem
          title="Guiding Principles"
          desc="Brief description about this blog post of the series."
          number="02"
          drops={"24/01"}
          colour={"#6C6CD8"}
          image="artwork-principles"
        />

        <ScalingRailwayPostItem
          title="Multi-service design with Canvas"
          desc="Brief description about this blog post of the series."
          number="03"
          drops={"31/01"}
          colour={"#6C6CD8"}
          image="artwork-roadmap"
        />
      </div>
    </div>
  )
}

const ScalingRailwayPostItem: React.FC<{
  title: string
  desc: string
  number: string
  slug?: string
  drops?: string
  colour: string
  image: string
}> = ({ title, desc, drops, number, slug, image, colour }) => {
  const Wrapper = slug ? Link : "div"
  const { theme } = useTheme()
  const isMounted = useIsMounted()

  return (
    <Wrapper
      {...(slug != null ? ({ href: slug } as any) : {})}
      className={cn(
        "px-8 py-10 bg-background dark:bg-gray-50 flex flex-col rounded-xl overflow-hidden",
        slug != null ? "hover:bg-secondaryBg" : ""
      )}
      style={{ boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.08)" }}
    >
      <div className="flex items-start justify-between -mr-8 -mt-10">
        {drops == null ? (
          <p
            className="pt-8 text-5xl font-mono opacity-[35%]"
            style={{ color: colour }}
          >
            {number}
          </p>
        ) : (
          <p className="mt-8 px-2 py-1 text-sm font-medium text-gray-400 bg-gray-50 dark:bg-gray-100 rounded whitespace-nowrap">
            Drops on {drops}
          </p>
        )}
        {isMounted && (
          <img src={`/illustrations/${image}--${theme}.svg`} alt="" />
        )}
      </div>

      <div
        className={cn(
          "flex flex-col justify-end flex-grow",
          slug != null ? "opacity-100" : "opacity-60"
        )}
      >
        <h3 className="text-2xl font-semibold mt-7 mb-2">{title}</h3>
        <p className="text-lg text-gray-500">{desc}</p>
      </div>
    </Wrapper>
  )
}
