import React from "react"
import Link from "@components/Link"
import Logo from "@components/Logo"
import { Moon, Sun } from "react-feather"
import { useTheme } from "next-themes"

const Nav: React.FC = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div className="max-w-5xl mx-auto">
      <nav className="py-4 px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-4">
          <Logo /> <span className="text-xl font-bold">Blog</span>
        </Link>

        <div className="text-gray-600 flex items-center space-x-6">
          <Link
            className="text-sm hover:text-pink-600"
            href="https://railway.app"
          >
            Go to Homepage
          </Link>

          <button
            className="hover:text-pink-600"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Nav
