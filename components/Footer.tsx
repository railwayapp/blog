import Link from "@components/Link"
import Logo from "@components/Logo"
import React from "react"

const railwayUrl = (page: string): string => `https://railway.app/${page}`

const Footer: React.FC = () => {
  return (
    <footer className="px-5 md:px-8 py-12 border-t border-gray-100">
      <div className="grid grid-cols-2 sm:grid-cols-12 gap-8 sm:gap-4 lg:gap-16 max-w-6xl mx-auto">
        <div className="hidden sm:flex col-span-3 lg:col-span-4 flex-col justify-between">
          <Link href="https://railway.app">
            <Logo />
          </Link>

          <Copyright />
        </div>

        <div className="col-span-1 sm:col-span-2">
          <p className="text-xs font-bold uppercase text-gray-500 mb-4">
            Product
          </p>
          <ul className="text-gray-500 space-y-4">
            <FooterListLink href={railwayUrl("changelog")}>
              Changelog
            </FooterListLink>
            <FooterListLink href={railwayUrl("pricing")}>
              Pricing
            </FooterListLink>
            <FooterListLink href={railwayUrl("starters")}>
              Starters
            </FooterListLink>
            <FooterListLink href={"https://feedback.railway.app"}>
              Feedback
            </FooterListLink>
            <FooterListLink href={railwayUrl("open-source-kickback")}>
              OSS Kickback
            </FooterListLink>
          </ul>
        </div>

        <div className="col-span-1 sm:col-span-2">
          <p className="text-xs font-bold uppercase text-gray-500 mb-4">
            Company
          </p>
          <ul className="text-gray-500 space-y-4">
            <FooterListLink href={railwayUrl("about")}>About</FooterListLink>
            <FooterListLink href={railwayUrl("careers")}>
              Careers
            </FooterListLink>
            <FooterListLink href={"/"}>Blog</FooterListLink>
            <FooterListLink href={"https://shop.railway.app"}>
              Shop
            </FooterListLink>
          </ul>
        </div>

        <div className="col-span-1 sm:col-span-2">
          <p className="text-xs font-bold uppercase text-gray-500 mb-4">
            Contact
          </p>
          <ul className="text-gray-500 space-y-4">
            <FooterListLink href={"https://discord.gg/railway"}>
              Discord
            </FooterListLink>
            <FooterListLink href={"https://twitter.com/railway"}>
              Twitter
            </FooterListLink>
            <FooterListLink href={"https://github.com/railwayapp"}>
              GitHub
            </FooterListLink>
            <FooterListLink href={"mailto:contact@railway.app"}>
              Email
            </FooterListLink>
          </ul>
        </div>

        <div className="col-span-1 sm:col-span-2">
          <p className="text-xs font-bold uppercase text-gray-500 mb-4">
            Legal
          </p>
          <ul className="text-gray-500 space-y-4">
            <FooterListLink href={railwayUrl("legal/fair-use")}>
              Fair Use
            </FooterListLink>
            <FooterListLink href={railwayUrl("legal/privacy")}>
              Privacy Policy
            </FooterListLink>
            <FooterListLink href={railwayUrl("legal/terms")}>
              Terms of Service
            </FooterListLink>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer

const FooterListLink: React.FC<{
  href: string
  children?: React.ReactNode
}> = ({ children, href }) => (
  <li>
    <Link href={href} className="hover:text-foreground">
      {children}
    </Link>
  </li>
)

const Copyright: React.FC = () => (
  <div className="text-xs text-gray-500 w-full">
    Copyright © {new Date().getFullYear()} Railway Corp. <br />
    All rights reserved.
  </div>
)
