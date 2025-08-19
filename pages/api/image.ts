import { NextApiHandler } from "next"
import { getChangelogImageSrc } from "../../lib/notion"

const handler: NextApiHandler = async (req, res) => {
  const blockId = req.query.blockId as string

  if (blockId == null) {
    res.status(404).json({ message: "Block ID is not defined" })
    return
  }

  try {
    const imageSrc = await getChangelogImageSrc(blockId)
    return res.json({ imageSrc })
  } catch {
    return res.status(500).json({ message: "Failed to fetch image" })
  }
}

export default handler
