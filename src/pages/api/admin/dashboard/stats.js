import { adminAuthMiddleware } from 'src/lib/adminAuthMiddleware'
import adminService from 'src/services/admin-service'

/**
 * /api/admin/dashboard/stats
 *
 * GET — Fetch dashboard statistics
 *
 * Query params:
 * - dateFrom: ISO date string for start of date range
 * - dateTo: ISO date string for end of date range
 *
 * Returns:
 * - totalEvents: Total number of events
 * - activeEvents: Events with status 'active' or 'published'
 * - totalUsers: Total number of users
 * - totalBookings: Total number of bookings
 * - totalRevenue: Sum of all confirmed booking amounts
 */
export default async function handler(req, res) {
  const { user, authenticated, error, permissions } = await adminAuthMiddleware(req, res)

  if (!authenticated) {
    return res.status(401).json({ success: false, message: error })
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  try {
    // Parse date filters
    const dateFromRaw = Array.isArray(req.query.dateFrom) ? req.query.dateFrom[0] : req.query.dateFrom
    const dateToRaw = Array.isArray(req.query.dateTo) ? req.query.dateTo[0] : req.query.dateTo
    const dateFrom = dateFromRaw ? new Date(dateFromRaw) : null
    const dateTo = dateToRaw ? new Date(dateToRaw) : null

    // Admin scoping — Admin sees only stats for their managed events
    const managerId = permissions.isOwner ? null : user.id
    const stats = await adminService.getDashboardStats(managerId, dateFrom, dateTo)

    return res.status(200).json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('[/api/admin/dashboard/stats]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
