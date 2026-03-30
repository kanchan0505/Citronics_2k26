import crypto from 'crypto'
import { dbOneOrNone, dbNone } from 'src/lib/database'
import { sendMail } from 'src/lib/mailer'
import rateLimit from 'src/lib/rateLimit'

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 })

/**
 * POST /api/auth/forgot-password
 *
 * Generates a secure password-reset token, stores its SHA-256 hash,
 * and emails the raw token to the user. Always returns 200 to avoid
 * leaking whether an email exists.
 *
 * Body: { email: string }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate-limit by IP
  const { ok } = limiter.check(req)
  if (!ok) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' })
  }

  const { email } = req.body

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' })
  }

  const trimmedEmail = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }

  try {
    // Always respond with success to avoid email enumeration
    const successMsg = 'If an account with that email exists, a password reset link has been sent.'

    const user = await dbOneOrNone(
      'SELECT id, name FROM users WHERE LOWER(email) = $1',
      [trimmedEmail]
    )

    if (!user) {
      return res.status(200).json({ message: successMsg })
    }

    // Invalidate any existing unused tokens for this user
    await dbNone(
      'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE',
      [user.id]
    )

    // Generate a cryptographically secure token
    const rawToken = crypto.randomBytes(32).toString('hex')

    // Store only the SHA-256 hash in DB
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await dbNone(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, expiresAt]
    )

    // Build reset URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`

    // Send email
    await sendMail({
      to: trimmedEmail,
      subject: 'Reset your Citronics 2026 password',
      html: buildResetEmailHtml(user.name, resetUrl),
      text: `Hi ${user.name},\n\nYou requested a password reset. Use this link (valid for 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.\n\nCitronics 2026`
    })

    return res.status(200).json({ message: successMsg })
  } catch (err) {
    console.error('[ForgotPassword] Error:', err)

    return res.status(500).json({ error: 'Something went wrong. Please try again later.' })
  }
}

function buildResetEmailHtml(name, resetUrl) {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
  <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 20px;">
      <tr><td align="center">
        <table width="100%" style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr><td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:28px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Citronics 2026</h1>
          </td></tr>
          <tr><td style="padding:32px;">
            <h2 style="margin:0 0 12px;font-size:18px;color:#1a1a2e;">Password Reset</h2>
            <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#555;">
              Hi <strong>${name}</strong>, we received a request to reset your password.
              Click the button below to choose a new one. This link expires in <strong>1 hour</strong>.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr><td style="background:#7c3aed;border-radius:8px;">
                <a href="${resetUrl}" target="_blank"
                   style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">
                  Reset Password
                </a>
              </td></tr>
            </table>
            <p style="margin:0 0 8px;font-size:12px;color:#888;">If the button doesn&rsquo;t work, copy and paste this URL:</p>
            <p style="margin:0 0 24px;font-size:12px;color:#7c3aed;word-break:break-all;">${resetUrl}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:0 0 16px;" />
            <p style="margin:0;font-size:12px;color:#999;line-height:1.5;">
              If you didn&rsquo;t request this, you can safely ignore this email. Your password won&rsquo;t change.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`
}
