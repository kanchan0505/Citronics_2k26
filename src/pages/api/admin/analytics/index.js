import { adminAuthMiddleware } from 'src/lib/adminAuthMiddleware'
import adminService from 'src/services/admin-service'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user, authenticated, error, permissions } = await adminAuthMiddleware(req, res)
  if (!authenticated) {
    return res.status(401).json({ error })
  }

  try {
    let period = parseInt(req.query.period) || 30
    // Validate and clamp period to safe positive range (1-365 days)
    period = Math.max(1, Math.min(365, period))
    const dateFromRaw = Array.isArray(req.query.dateFrom) ? req.query.dateFrom[0] : req.query.dateFrom
    const dateToRaw = Array.isArray(req.query.dateTo) ? req.query.dateTo[0] : req.query.dateTo
    const dateFrom = dateFromRaw ? new Date(dateFromRaw) : null
    const dateTo = dateToRaw ? new Date(dateToRaw) : null
    // Admin scoping — Admin sees only analytics for their managed events
    const managerId = permissions.isOwner ? null : user.id
    const data = await adminService.getAnalytics(period, managerId, dateFrom, dateTo)

    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error('Analytics fetch error:', error)

    return res.status(500).json({ error: 'Failed to fetch analytics' })
  }
}