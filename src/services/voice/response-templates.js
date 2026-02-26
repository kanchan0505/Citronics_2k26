/**
 * Response Templates — Citro
 *
 * Deterministic reply strings for each intent.
 * No AI generation — every response is pre-authored.
 *
 * Returns { reply, action, data } objects consumed by the UI layer.
 * Supports a friendly Citro personality without being chatbot-y.
 */

const TEMPLATES = {
  // ── Navigation ────────────────────────────────────────────────────────────
  NAV_HOME: {
    reply: 'Taking you home!',
    action: { type: 'navigate', path: '/' }
  },
  NAV_DASHBOARD: {
    reply: 'Opening your dashboard.',
    action: { type: 'navigate', path: '/dashboard' }
  },
  NAV_EVENTS: {
    reply: 'Here are the events!',
    action: { type: 'navigate', path: '/events' }
  },
  NAV_SCHEDULE: {
    reply: 'Opening the schedule.',
    action: { type: 'navigate', path: '/schedule' }
  },
  NAV_LOGIN: {
    reply: 'Taking you to the login page.',
    action: { type: 'navigate', path: '/login' }
  },
  NAV_REGISTER: {
    reply: 'Opening the registration page.',
    action: { type: 'navigate', path: '/register' }
  },

  // ── Queries ───────────────────────────────────────────────────────────────
  QUERY_STATS: {
    reply: (ctx) => {
      if (!ctx.data) return 'Could not fetch stats right now.'
      const d = ctx.data
      return `Here's a quick overview: ${d.total_events} total events, ${d.active_events} active, ${d.total_registrations} registrations, and ${d.tickets_sold} tickets sold.`
    },
    action: { type: 'display', widget: 'stats' }
  },
  QUERY_UPCOMING_EVENTS: {
    reply: (ctx) => {
      if (!ctx.data || ctx.data.length === 0) return 'No upcoming events found right now.'
      const names = ctx.data.slice(0, 3).map(e => e.title).join(', ')
      return `Upcoming events: ${names}${ctx.data.length > 3 ? ` and ${ctx.data.length - 3} more.` : '.'}`
    },
    action: { type: 'display', widget: 'upcoming-events' }
  },
  SEARCH_EVENT: {
    reply: (ctx) => `Searching for "${ctx.entities?.name || 'events'}"...`,
    action: { type: 'navigate', path: '/events', query: true }
  },
  REGISTER_EVENT: {
    reply: (ctx) => `Starting registration for "${ctx.entities?.name || 'the event'}".`,
    action: { type: 'execute', handler: 'register' }
  },
  QUERY_MY_REGISTRATIONS: {
    reply: 'Fetching your registrations.',
    action: { type: 'display', widget: 'my-registrations' }
  },

  // ── Greeting / Meta ───────────────────────────────────────────────────────
  GREETING: {
    reply: "Hey! I'm Citro, your event assistant. Try saying 'show events' or 'open dashboard'.",
    action: null
  },
  HELP: {
    reply: "I can help you navigate, search events, register, and check stats. Try: 'show events', 'open dashboard', 'upcoming events', or 'register for hackathon'.",
    action: null
  },
  THANK_YOU: {
    reply: 'Happy to help! Let me know if you need anything else.',
    action: null
  },
  WHO_ARE_YOU: {
    reply: "I'm Citro — the voice assistant for Citronics. I help you navigate and interact with the event platform using voice commands!",
    action: null
  },

  // ── Fallbacks ─────────────────────────────────────────────────────────────
  LOW_CONFIDENCE: {
    reply: (ctx) => `Sorry, I didn't quite get "${ctx.transcript || 'that'}". Try saying 'show events' or 'help'.`,
    action: null
  },
  UNKNOWN: {
    reply: "I'm not sure what you mean. Try 'help' to see what I can do.",
    action: null
  }
}

/**
 * buildResponse — main export
 *
 * @param {string} intent  Intent key
 * @param {object} ctx     Context data (entities, data from resolver, confidence)
 * @returns {object}       { reply: string, action: object|null, data: any, intent, confidence }
 */
export function buildResponse(intent, ctx = {}) {
  const template = TEMPLATES[intent] || TEMPLATES.UNKNOWN

  const reply = typeof template.reply === 'function' ? template.reply(ctx) : template.reply

  return {
    reply,
    action: template.action || null,
    data: ctx.data || null,
    intent,
    confidence: ctx.confidence || 0
  }
}
