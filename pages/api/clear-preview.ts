import { NextApiRequest, NextApiResponse } from 'next'

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.query.slug) {
    res.clearPreviewData()
    res.writeHead(307, { Location: `/p/${req.query.slug}` })
    res.end()
  } else {
    res.clearPreviewData()
    res.writeHead(307, { Location: `/` })
    res.end()
  }
}
