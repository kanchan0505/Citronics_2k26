import mediaService from 'src/services/media-service'

/**
 * /api/media/[page]
 * GET — Fetch media entries for a given page, with optional post filter.
 *
 * Query params:
 *   - page: (required) The page name (e.g., 'gallery', 'team', 'about-citronics')
 *   - post: (optional) Filter by post type (e.g., 'flash-mob', 'president')
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
    const media = await mediaService.getMediaByPage(page, post)

    return res.status(200).json({ success: true, data: media })
  } catch (error) {
    console.error('[/api/media/[page]]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
