import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { dbOneOrNone, dbTx } from 'src/lib/database'
import rateLimit from 'src/lib/rateLimit'

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })

/**
 * POST /api/auth/reset-password
 *
 * Validates the reset token, checks expiry, and updates the user's password.
 * The raw token is hashed with SHA-256 and compared against the stored hash.
 *
 * Body: { token: string, password: string }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { ok } = limiter.check(req)
  if (!ok) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' })
  }

  const { token, password } = req.body

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Reset token is required' })
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    const resetRecord = await dbOneOrNone(
      `SELECT prt.id, prt.user_id, prt.expires_at, prt.used, u.email
       FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token_hash = $1`,
      [tokenHash]
    )

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset link. Please request a new one.' })
    }

    if (resetRecord.used) {
      return res.status(400).json({ error: 'This reset link has already been used. Please request a new one.' })
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return res.status(400).json({ error: 'This reset link has expired. Please request a new one.' })
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 12)

    // Update password & mark token used in a transaction
    await dbTx(async t => {
      await t.none(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [passwordHash, resetRecord.user_id]
      )
      await t.none(
        'UPDATE password_reset_tokens SET used = TRUE WHERE id = $1',
        [resetRecord.id]
      )
      // Invalidate all other unused tokens for this user
      await t.none(
        'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND id != $2 AND used = FALSE',
        [resetRecord.user_id, resetRecord.id]
      )
    })

    return res.status(200).json({ message: 'Password has been reset successfully. You can now sign in.' })
  } catch (err) {
    console.error('[ResetPassword] Error:', err)

    return res.status(500).json({ error: 'Something went wrong. Please try again later.' })
  }
}
