/**
 * Command Resolver — Citro
 *
 * Maps detected intents → actual service calls.
 * Reuses existing services (dashboard-service, etc.) — no duplication.
 *
 * Called from the voice service facade (index.js) via the API layer.
 * This is the ONLY place where business logic execution happens for voice.
 */
import dashboardService from 'src/services/dashboard-service'

/**
 * resolveCommand — execute the action for a detected intent
 *
 * @param {string} intent     Intent ID from intent-engine
 * @param {object} entities   Extracted entities { name, date, etc. }
 * @param {object} context    { userId, role, session } from API layer
 * @returns {object}          { success, data, action, error? }
 */
export async function resolveCommand(intent, entities, context) {
  switch (intent) {
    // ── Navigation intents — no DB calls, just return route info ───────────
    case 'NAV_HOME':
    case 'NAV_DASHBOARD':
    case 'NAV_EVENTS':
    case 'NAV_SCHEDULE':
    case 'NAV_LOGIN':
    case 'NAV_REGISTER':
      return { success: true, data: null }

    // ── Dashboard stats ───────────────────────────────────────────────────
    case 'QUERY_STATS': {
      try {
        const stats = await dashboardService.getStats()
        return { success: true, data: stats }
      } catch (err) {
        return { success: false, error: 'Could not fetch stats' }
      }
    }

    // ── Upcoming events ───────────────────────────────────────────────────
    case 'QUERY_UPCOMING_EVENTS': {
      try {
        const events = await dashboardService.getUpcomingEvents()
        return { success: true, data: events }
      } catch (err) {
        return { success: false, error: 'Could not fetch events' }
      }
    }

    // ── Search events (placeholder — will wire to event service) ──────────
    case 'SEARCH_EVENT': {
      // TODO: Wire to event search service once events service is built
      return {
        success: true,
        data: null,
        message: `Searching for "${entities.name || 'unknown'}"`
      }
    }

    // ── Register for event (placeholder — will wire to registration) ──────
    case 'REGISTER_EVENT': {
      // TODO: Wire to registration service
      return {
        success: true,
        data: null,
        message: `Registration flow for "${entities.name || 'unknown'}"`
      }
    }

    // ── My registrations (placeholder) ────────────────────────────────────
    case 'QUERY_MY_REGISTRATIONS': {
      // TODO: Wire to user registration service
      return { success: true, data: null }
    }

    // ── Greeting / Meta — no service calls needed ─────────────────────────
    case 'GREETING':
    case 'HELP':
    case 'THANK_YOU':
    case 'WHO_ARE_YOU':
      return { success: true, data: null }

    // ── Unknown / fallback ────────────────────────────────────────────────
    default:
      return { success: false, data: null }
  }
}
