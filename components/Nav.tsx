import React from "react"
import Link from "@components/Link"
import Logo from "@components/Logo"
import { Moon, Sun } from "react-feather"
import { useTheme } from "next-themes"
import { useIsMounted } from "../hooks/useIsMounted"
import { useRouter } from "next/router"
import { cn } from "../utils"

const Nav: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const isMounted = useIsMounted()
  const { asPath } = useRouter()

  const isHome = asPath === "/"

  return (
    <div className="max-w-6xl px-5 md:px-8 mx-auto">
      <nav
        className={cn(
          "py-6 flex justify-between items-center border-b border-transparent",
          isHome ? "" : "border-gray-100"
        )}
      >
        <Link href="/" className="flex items-center space-x-4">
          <Logo />
          <span className="text-xl font-bold">Blog</span>
        </Link>

        <div className="text-gray-600 flex items-center space-x-6">
          <Link
            className="text-sm hover:text-pink-600"
            href="https://railway.app"
          >
            Go to Homepage
          </Link>

          {isMounted && (
            <button
              className="hover:text-pink-600"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}

export default Nav
