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
          <h1 className="text-[42px] font-bold mb-3 tracking-tight">
            Scaling Railway
          </h1>
          <p className="text-lg text-gray-600">
            Learn how we keep the train going, on-time, and fire-free.
          </p>
        </div>

        {/* <Link
          href="/scaling-railway"
          className="md:col-span-2 text-center text-pink-700 border border-pink-200 rounded-md px-4 py-2 hover:text-pink-800 hover:border-pink-500 transition-colors duration-100"
        >
          All Scaling Railway Posts →
        </Link> */}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <ScalingRailwayPostItem
          title="Roadmap"
          desc="Introducing the Scaling Railway series "
          number="01"
          slug={"/p/scaling-railway-roadmap"}
          colour={"#6C6CD8"}
          image="artwork-roadmap"
        />

        <ScalingRailwayPostItem
          title="Guiding Principles"
          desc="These are the core concepts that we use to build Railway"
          number="02"
          drops={"01/24"}
          colour={"#6C6CD8"}
          image="artwork-principles"
        />

        <ScalingRailwayPostItem
          title="Multi-service design with Canvas"
          desc="All of us write code so we all know what's on the table"
          number="03"
          drops={"01/31"}
          colour={"#6C6CD8"}
          image="artwork-canvas"
          className="block md:hidden lg:block"
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
  className?: string
}> = ({ title, desc, drops, number, slug, image, colour, className }) => {
  const Wrapper = slug ? Link : "div"
  const { theme } = useTheme()
  const isMounted = useIsMounted()

  return (
    <Wrapper
      {...(slug != null ? ({ href: slug } as any) : {})}
      className={cn(
        "px-8 py-10 min-h-[356px] bg-background dark:bg-gray-50 border border-transparent flex flex-col rounded-xl overflow-hidden shadow-[0px_1px_2px_rgba(0,_0,_0,_0.08)]",
        slug != null
          ? "hover:border-pink-200 hover:shadow-[0px_1px_0px_4px_rgba(179,_45,_242,_0.05)] dark:hover:shadow-none"
          : "",
        className
      )}
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
          slug != null ? "opacity-100" : "opacity-30"
        )}
      >
        <h3 className="max-w-[220px] text-2xl font-semibold mt-7 mb-2">
          {title}
        </h3>
        <p className="max-w-[240px] text-lg text-gray-500">{desc}</p>
      </div>
    </Wrapper>
  )
}
