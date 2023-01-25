import React from "react"
import { useIsMounted } from "../hooks/useIsMounted"
import { Blob } from "./Blob"
import { cn } from "../utils"
import Link from "./Link"

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
          <h1 className="text-[42px] font-bold mb-3">Customer Stories</h1>
          <p className="text-lg text-gray-600">
            Interviews with customers who are building amazing things with
            Railway
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
              Building a new cloud-based collaborative CAD tool. Q&A with Paul
              O&apos;Carroll from <span className="underline">Arcol</span>
            </>
          }
          slug={"/p/software-for-architects-paul-ocarroll-arcol-interview"}
          image="/illustrations/arcol.png"
          avatars={[
            "/illustrations/arcol-avatar.png",
            "/illustrations/arcol-paul.png",
          ]}
        />

        <CustomerStoryPostItem
          title={
            <>
              Building a new kind of professional network. Q&A with Yogini Bende
              from <span className="underline">Peerlist</span>
            </>
          }
          drops={"01/26"}
          image="/illustrations/peerlist.png"
          avatars={[
            "/illustrations/peerlist-avatar.png",
            "/illustrations/peerlist-yogini.png",
          ]}
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
        "grid grid-cols-3",
        slug != null
          ? "hover:border-pink-200 hover:shadow-[0px_1px_0px_4px_rgba(179,_45,_242,_0.05)] dark:hover:shadow-none"
          : "",
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
            "max-w-xs text-xl font-medium mt-7 mb-2",
            slug == null ? "opacity-40" : ""
          )}
        >
          {title}
        </h3>
      </div>

      {isMounted && (
        <div className="w-full h-full relative overflow-hidden">
          <img
            src={`${image}`}
            alt=""
            className={cn(
              "max-w-[initial] absolute top-[-32px] opacity-90",
              slug == null ? "opacity-40" : ""
            )}
          />
        </div>
      )}

      {/* <div className="flex items-start justify-between -mr-8 -mt-10">
        {drops != null && (
          <p className="mt-8 px-2 py-1 text-sm font-medium text-gray-400 bg-gray-50 dark:bg-gray-100 rounded whitespace-nowrap">
            Available on {drops}
          </p>
        )}
        {isMounted && (
          <img src={`/illustrations/${image}--${theme}.svg`} alt="" />
        )}
      </div> */}

      {/* <div
        className={cn(
          "flex flex-col justify-end flex-grow",
          slug != null ? "opacity-100" : "opacity-30"
        )}
      >
        <h3 className="max-w-[220px] text-2xl font-semibold mt-7 mb-2">
          {title}
        </h3>
      </div> */}
    </Wrapper>
  )
}
