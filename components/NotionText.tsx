import Link from "@components/Link"
import React, { Fragment } from "react"
import Image from "next/image"
import { twMerge } from "tailwind-merge"

const TEMPLATE_PATHS = [
  "https://railway.com/new/template",
  "https://railway.com/template/",
]

/**
 * This type is harcoded here as I couldn't really find anything
 * in the Notion API that corresponds to the actual data
 */
export interface TextProps {
  annotations?: {
    bold?: boolean
    italic?: boolean
    strikethrough?: boolean
    underline?: boolean
    code?: boolean
    color?: string
  }
  href?: string
  plain_text: string
  text?: {
    content: string
    link?: {
      url: string
    }
  }
  type?: string
}

const RenderTextContent: React.FC<{
  isCode: boolean
  content: string
  className?: string
}> = ({ isCode, content, className }) =>
  isCode ? (
    <code className="text-pink-600 whitespace-normal break-words">
      {content}
    </code>
  ) : (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: content.replace("\n", "<br/>") }}
    />
  )

export const NotionText: React.FC<{
  text: TextProps[] | null
  noLinks?: boolean
}> = ({ text, noLinks }) => {
  if (text == null) {
    return null
  }

  return (
    <>
      {text.map((value, idx) => {
        const annotations = value.annotations || {}
        const bold = annotations.bold || false
        const code = annotations.code || false
        const italic = annotations.italic || false
        const strikethrough = annotations.strikethrough || false
        const underline = annotations.underline || false
        const textContent = value.text
        if (textContent == null && !value.plain_text) {
          return null
        }

        let classes = ""
        if (bold) classes += "font-semibold"
        if (italic) classes += " italic"
        if (strikethrough) classes += " line-through"
        if (underline) classes += " underline"

        const content = textContent?.content || value.plain_text || ''
        const linkUrl = textContent?.link?.url || value.href
        
        return (
          <Fragment key={idx}>
            {linkUrl != null && !noLinks ? (
              <>
                {content === linkUrl &&
                TEMPLATE_PATHS.some((path) => linkUrl.includes(path)) ? (
                  <Link href={linkUrl} className="flex justify-center">
                    <Image src="/button.svg" height={48} width={240} alt="" />
                  </Link>
                ) : (
                  <Link
                    href={linkUrl}
                    className="underline hover:text-pink-600"
                  >
                    <RenderTextContent
                      isCode={code}
                      content={content}
                      className={classes}
                    />
                  </Link>
                )}
              </>
            ) : (
              <RenderTextContent
                isCode={code}
                content={content}
                className={classes}
              />
            )}
          </Fragment>
        )
      })}
    </>
  )
}

export const NotionList: React.FC<{
  type: string
  children?: React.ReactNode
  className?: string
}> = ({ type, children, className }) =>
  type === "ul" ? (
    <ul className={twMerge("list-disc pl-6 mb-6", className)}>{children}</ul>
  ) : (
    <ol className={twMerge("list-decimal pl-6 mb-6", className)}>{children}</ol>
  )
