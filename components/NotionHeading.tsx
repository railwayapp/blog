import { RichText } from "@notionhq/client/build/src/api-types"
import Link from "@components/Link"
import { NotionText } from "@components/NotionText"

const convertHeadingToId = (heading: RichText[]) => {
  return heading[0].plain_text
    .toLowerCase()
    .replace(/\s/g, "-")
    .replace(/[?!:]/g, "")
}

type HeadingTypes = "heading_1" | "heading_2" | "heading_3"
interface HeadingConfig {
  classes: string
  as: string
}
const headingConfig: Record<HeadingTypes, HeadingConfig> = {
  heading_1: {
    classes: "text-4xl font-bold leading-snug mt-16 mb-8",
    as: "h1",
  },
  heading_2: {
    classes: "text-2xl font-bold mt-16 mb-8",
    as: "h2",
  },
  heading_3: {
    classes: "text-xl font-bold",
    as: "h3",
  },
}

interface Props {
  type: HeadingTypes
  text: RichText[]
}
export const NotionHeading: React.FC<Props> = ({ type, text }) => {
  const id = convertHeadingToId(text)
  const config = headingConfig[type]

  return (
    <Link href={`#${id}`}>
      {type === "heading_1" && (
        <h1 className={config.classes}>
          <NotionText text={text} />
        </h1>
      )}
      {type === "heading_2" && (
        <h2 className={config.classes}>
          <NotionText text={text} />
        </h2>
      )}
      {type === "heading_3" && (
        <h3 className={config.classes}>
          <NotionText text={text} />
        </h3>
      )}
    </Link>
  )
}
