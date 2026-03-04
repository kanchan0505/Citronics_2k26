import eventService from 'src/services/event-service'

/**
 * /api/home
 * GET — All data needed for the public home page in a single request.
 *
 * Returns: featuredEvents (up to 3), upcomingEvents (up to 10, newest first)
 *
 * Public endpoint — no authentication required.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  try {
    const [featuredEvents, upcomingEvents] = await Promise.all([
      eventService.getFeaturedEvents(3),
      eventService.getPublishedEvents({ limit: 10, sort: 'newest' })
    ])

    return res.status(200).json({
      success: true,
      data: {
        featuredEvents,
        upcomingEvents
      }
    })
  } catch (error) {
    console.error('[/api/home]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
