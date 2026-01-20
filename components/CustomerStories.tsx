import React from "react"
import { useIsMounted } from "../hooks/useIsMounted"
import { Blob } from "./Blob"
import { cn } from "../utils"
import Link from "./Link"
import Image from "next/image"

export const CustomerStories: React.FC = () => {
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
          <h1 className="text-[42px] font-serif font-semibold mb-3 tracking-tight">
            Customer Stories
          </h1>
          <p className="text-lg text-gray-600">
            Learn how our customers take most advantage of our platform.
          </p>
        </div>

        {/* <Link
          href="/scaling-railway"
          className="md:col-span-2 text-center text-pink-700 border border-pink-200 rounded-md px-4 py-2 hover:text-pink-800 hover:border-pink-500 transition-colors duration-100"
        >
          All Scaling Railway Posts →
        </Link> */}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <CustomerStoryPostItem
          title={
            <>
              How <span className="underline">Bilt&apos;s</span> Marketing
              Engineering Team Delivers at Scale with Railway
            </>
          }
          slug={"/p/bilt-deliver-scale"}
          image="/customers/product-image--bilt.webp"
          avatars={["/customers/bilt-avatar.webp"]}
        />

        <CustomerStoryPostItem
          title={
            <>
              <span className="underline">MindFort</span> Runs 100+ AI Pen
              Testing Agents Without Their Previous $10k AWS Bill
            </>
          }
          slug={"/p/mindfort-railway"}
          image="/customers/product-image--mindfort.webp"
          avatars={["/customers/mindfort-avatar.webp"]}
        />
      </div>
    </div>
  )
}

const CustomerStoryPostItem: React.FC<{
  title: React.ReactElement
  slug?: string
  drops?: string
  image: string
  className?: string
  avatars?: string[]
}> = ({ title, avatars, drops, slug, image, className }) => {
  const Wrapper = slug ? Link : "div"
  const isMounted = useIsMounted()

  return (
    <Wrapper
      {...(slug != null ? ({ href: slug } as any) : {})}
      className={cn(
        "min-h-[288px] bg-gray-100 dark:bg-gray-50 flex flex-col overflow-hidden rounded-tl-xl rounded-tr-[48px] rounded-br-xl rounded-bl-[32px]",
        "grid grid-cols-3 border border-black border-opacity-5 dark:border-white dark:border-opacity-5",
        slug != null ? "hover:bg-gray-200 dark:hover:bg-gray-100" : "",
        className
      )}
    >
      <div className="col-span-2 flex flex-col justify-end my-8 ml-8">
        {drops != null && (
          <p className="max-w-max mb-auto px-2 py-1 text-sm font-medium text-gray-400 bg-background dark:bg-gray-100 rounded whitespace-nowrap">
            Available on {drops}
          </p>
        )}

        <div
          className={cn("flex -space-x-2", slug == null ? "opacity-40" : "")}
        >
          {avatars.map((a, i) => (
            <img
              key={a}
              className="w-10 h-10 rounded-full"
              src={a}
              alt=""
              style={{ zIndex: 10 - i }}
            />
          ))}
        </div>

        <h3
          className={cn(
            "max-w-xs text-xl font-medium mt-7 mb-2 tracking-tight",
            slug == null ? "opacity-40" : ""
          )}
        >
          {title}
        </h3>
      </div>

      {isMounted && (
        <div className="w-[250%] h-full relative -rotate-6">
          <Image
            src={`${image}`}
            alt={`Product image for ${title}`}
            className={cn(
              "absolute top-0 md:top-[initial] md:bottom-0 left-0",
              slug == null ? "opacity-40" : ""
            )}
            width={1350}
            height={840}
            style={{
              filter: "drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.08))",
            }}
          />
        </div>
      )}
    </Wrapper>
  )
}
