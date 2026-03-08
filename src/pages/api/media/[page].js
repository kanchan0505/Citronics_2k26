import { dbAny } from 'src/lib/database'

/**
 * /api/media/[page]
 * GET — Fetch all media entries for a given page name.
 *
 * Returns: array of { id, page, description, links }
 *
 * Public endpoint — no authentication required.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  const { page } = req.query

  if (!page || typeof page !== 'string') {
    return res.status(400).json({ success: false, message: 'Page parameter is required' })
  }

  try {
    const media = await dbAny(
      'SELECT id, page, name, post, description, links FROM page_media WHERE page = $1 ORDER BY id ASC',
      [page]
    )

    return res.status(200).json({ success: true, data: media })
  } catch (error) {
    console.error('[/api/media]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
