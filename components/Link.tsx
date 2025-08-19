import React, { useMemo } from "react"
import NLink from "next/link"
import { cn } from "utils"

export interface Props {
  href: string
  children: React.ReactNode
  external?: boolean
  id?: string
  className?: string
  style?: React.CSSProperties
}

const isExternalLink = (href: string) =>
  href == null || href.startsWith("http://") || href.startsWith("https://")

const useIsExternalLink = (href: string) =>
  useMemo(() => isExternalLink(href), [href])

const Link = ({ href, external, children, className, ...props }: Props) => {
  const isExternal = (useIsExternalLink(href) || external) ?? false

  if (isExternal) {
    return (
      <a
        className={cn("underline", className)}
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <NLink href={href} passHref {...props} className={className}>
      {children}
    </NLink>
  )
}

export default Link
