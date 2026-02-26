/**
 * /api/voice/process
 * POST — Bridge between Citro UI and voice service layer.
 *
 * Flow: Auth check → validate transcript → call voiceService → return response
 * Follows the same pattern as /api/dashboard/stats.js
 *
 * Request body:  { transcript: string }
 * Response:      { success, data: { reply, action, data, intent, confidence } }
 */
import { getServerSession } from 'next-auth'
import nextAuthConfig from 'src/lib/nextAuthConfig'
import { processCommand } from 'src/services/voice'

export default async function handler(req, res) {
  // Only POST allowed
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
  }

  try {
    // Auth check — voice commands require authenticated session
    const session = await getServerSession(req, res, nextAuthConfig)
    if (!session) {
      return res.status(401).json({ success: false, message: 'Not authenticated' })
    }

    // Validate transcript
    const { transcript } = req.body
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Transcript is required' })
    }

    // Sanitize — limit length to prevent abuse
    const sanitized = transcript.trim().substring(0, 500)

    // Build context from session (passed to service layer)
    const context = {
      userId: session.user?.id,
      role: session.user?.role || 'Student',
      email: session.user?.email
    }

    // Process through voice service pipeline
    const result = await processCommand(sanitized, context)

    return res.status(200).json({ success: true, data: result })
  } catch (error) {
    console.error('[/api/voice/process]', error)
    return res.status(500).json({ success: false, message: 'Voice processing failed' })
  }
}
