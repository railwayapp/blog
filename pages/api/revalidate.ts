import type { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.query.secret !== process.env.CLIENT_REVALIDATION_SECRET) {
    const status = 401
    return res.status(status).json({ status, message: "Invalid token" })
  }

  const path = req.query.path
  if (path == null || Array.isArray(path) || path.trim() === "") {
    const status = 400
    return res.status(status).json({ status, message: "Please specify a path" })
  }

  try {
    await res.revalidate(path)

    const status = 200
    return res
      .status(status)
      .json({ status, message: `Revalidation successful for ${path}` })
  } catch (error) {
    const status = 500
    return res
      .status(status)
      .json({ status, message: `Error revalidating ${path}` })
  }
}

export default handler
