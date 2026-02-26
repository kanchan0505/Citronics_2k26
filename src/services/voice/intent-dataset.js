/**
 * Intent Dataset — Citro
 *
 * Deterministic pattern definitions mapping phrases → intents.
 * Each intent has:
 *   - id:        unique intent key
 *   - patterns:  array of canonical English phrases that trigger this intent
 *   - entities:  optional entity extraction hints
 *   - action:    what the UI should do (navigate, display, execute)
 *
 * Patterns are matched after normalization (Hinglish → English).
 * Order matters — first match with highest confidence wins.
 */

const INTENTS = [
  // ── Navigation ────────────────────────────────────────────────────────────
  {
    id: 'NAV_HOME',
    patterns: ['go home', 'open home', 'show home', 'home page', 'take me home', 'go to home'],
    action: { type: 'navigate', path: '/' }
  },
  {
    id: 'NAV_DASHBOARD',
    patterns: ['open dashboard', 'show dashboard', 'go to dashboard', 'dashboard', 'my dashboard'],
    action: { type: 'navigate', path: '/dashboard' }
  },
  {
    id: 'NAV_EVENTS',
    patterns: [
      'show events', 'open events', 'go to events', 'events page',
      'all events', 'show all events', 'list events', 'events'
    ],
    action: { type: 'navigate', path: '/events' }
  },
  {
    id: 'NAV_SCHEDULE',
    patterns: ['show schedule', 'open schedule', 'schedule', 'event schedule', 'go to schedule'],
    action: { type: 'navigate', path: '/schedule' }
  },
  {
    id: 'NAV_LOGIN',
    patterns: ['login', 'log in', 'sign in', 'go to login'],
    action: { type: 'navigate', path: '/login' }
  },
  {
    id: 'NAV_REGISTER',
    patterns: ['sign up', 'create account', 'go to register', 'register page'],
    action: { type: 'navigate', path: '/register' }
  },

  // ── Event Queries ─────────────────────────────────────────────────────────
  {
    id: 'QUERY_UPCOMING_EVENTS',
    patterns: [
      'upcoming events', 'show upcoming events', 'what events are coming',
      'next events', 'new events', 'upcoming', 'what is coming up'
    ],
    action: { type: 'query', handler: 'getUpcomingEvents' }
  },
  {
    id: 'SEARCH_EVENT',
    patterns: [
      'search event $name', 'find event $name', 'search $name',
      'find $name event', 'look for $name'
    ],
    entities: ['name'],
    action: { type: 'query', handler: 'searchEvents' }
  },

  // ── Registration ──────────────────────────────────────────────────────────
  {
    id: 'REGISTER_EVENT',
    patterns: [
      'register for $name', 'register do $name', 'sign up for $name',
      'do registration $name', 'register $name', 'enroll $name'
    ],
    entities: ['name'],
    action: { type: 'execute', handler: 'registerForEvent' }
  },

  // ── Dashboard Stats ───────────────────────────────────────────────────────
  {
    id: 'QUERY_STATS',
    patterns: [
      'show stats', 'dashboard stats', 'how many events',
      'total events', 'total registrations', 'show statistics'
    ],
    action: { type: 'query', handler: 'getStats' }
  },
  {
    id: 'QUERY_MY_REGISTRATIONS',
    patterns: [
      'my registrations', 'show my registrations', 'what did register for',
      'my events', 'registered events', 'show my events'
    ],
    action: { type: 'query', handler: 'getMyRegistrations' }
  },

  // ── Greetings / Meta ──────────────────────────────────────────────────────
  {
    id: 'GREETING',
    patterns: ['hello', 'hi', 'namaste', 'hey', 'good morning', 'good evening'],
    action: { type: 'reply' }
  },
  {
    id: 'HELP',
    patterns: ['help', 'what can you do', 'commands', 'show help', 'how to use'],
    action: { type: 'reply' }
  },
  {
    id: 'THANK_YOU',
    patterns: ['thank you', 'thanks', 'shukriya', 'dhanyavaad'],
    action: { type: 'reply' }
  },
  {
    id: 'WHO_ARE_YOU',
    patterns: ['who are you', 'what are you', 'your name', 'introduce yourself'],
    action: { type: 'reply' }
  }
]

export default INTENTS
