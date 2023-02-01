import Link from "@components/Link"
import React, { Fragment } from "react"
import Image from "next/image"

const TEMPLATE_PATH = "https://railway.app/new/template"

/**
 * This type is harcoded here as I couldn't really find anything
 * in the Notion API that corresponds to the actual data
 */
interface TextProps {
  annotations: {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color: string
  }
  href?: string
  plain_text: string
  text?: {
    content: string
    link?: {
      url: string
    }
  }
  type: string
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
        const {
          annotations: { bold, code, italic, strikethrough, underline },
          text,
        } = value
        if (text == null) {
          return null
        }

        let classes = ""
        if (bold) classes += "font-semibold"
        if (italic) classes += " italic"
        if (strikethrough) classes += " line-through"
        if (underline) classes += " underline"

        return (
          <Fragment key={idx}>
            {text.link != null && !noLinks ? (
              <>
                {text.link.url.includes(TEMPLATE_PATH) &&
                text.content === text.link.url ? (
                  <Link href={text.link.url} className="flex justify-center">
                    <Image src="/button.svg" height={48} width={240} alt="" />
                  </Link>
                ) : (
                  <Link
                    href={text.link.url}
                    className="underline hover:text-pink-600"
                  >
                    <RenderTextContent
                      isCode={code}
                      content={text.content}
                      className={classes}
                    />
                  </Link>
                )}
              </>
            ) : (
              <RenderTextContent
                isCode={code}
                content={text.content}
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
}> = ({ type, children }) =>
  type === "ul" ? (
    <ul className="list-disc pl-6 mb-6">{children}</ul>
  ) : (
    <ol className="list-decimal pl-6 mb-6">{children}</ol>
  )
