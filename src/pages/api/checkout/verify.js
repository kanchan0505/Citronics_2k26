import checkoutService from 'src/services/checkout-service'

/**
 * POST /api/checkout/verify
 *
 * Verifies an existing user's identity by phone or email + password.
 * Accepts either `identifier` (phone or email) or legacy `phone` field.
 * Only returns userId after a successful bcrypt password match.
 *
 * Security: Returns the same generic error whether the identifier is missing
 * or password is wrong — prevents account enumeration.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // Accept new `identifier` field or legacy `phone` field
    const { identifier, phone: legacyPhone, password } = req.body
    const rawIdentifier = ((identifier || legacyPhone) ?? '').trim()

    if (!rawIdentifier || !password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'identifier and password are required' })
    }

    const isEmail = EMAIL_RE.test(rawIdentifier)
    let result

    if (isEmail) {
      result = await checkoutService.verifyUserByEmail(rawIdentifier, password)
    } else {
      const clean = rawIdentifier.replace(/[\s\-+()]/g, '').slice(-10)
      if (!/^\d{10}$/.test(clean)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number' })
      }
      result = await checkoutService.verifyUserByPhone(clean, password)
    }

    if (!result) {
      // Generic message — don't reveal whether identifier or password was wrong
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' })
    }

    return res.status(200).json({ success: true, data: { userId: result.userId } })
  } catch (error) {
    console.error('[POST /api/checkout/verify]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}