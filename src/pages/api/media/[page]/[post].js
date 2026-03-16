import { dbAny } from 'src/lib/database'

/**
 * /api/media/[page]/[post]
 * GET — Fetch media entries for a given page and optional post filter.
 *
 * Query params:
 *   - page: (required) The page name (e.g., 'gallery')
 *   - post: (optional) Filter by post type (e.g., 'flash-mob')
 *
 * Returns: array of { id, page, name, post, description, links }
 *
 * Public endpoint — no authentication required.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  const { page, post } = req.query

  if (!page || typeof page !== 'string') {
    return res.status(400).json({ success: false, message: 'Page parameter is required' })
  }

  try {
    let media = []
    
    if (post && typeof post === 'string') {
      // Filter by post type
      media = await dbAny(
        'SELECT id, page, name, post, description, links FROM page_media WHERE page = $1 AND post = $2 ORDER BY id ASC',
        [page, post]
      )
    } else {
      // Get all media for this page
      media = await dbAny(
        'SELECT id, page, name, post, description, links FROM page_media WHERE page = $1 ORDER BY id ASC',
        [page]
      )
    }

    return res.status(200).json({ success: true, data: media })
  } catch (error) {
    console.error('[/api/media/[page]/[post]]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
