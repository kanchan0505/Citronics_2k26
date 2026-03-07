import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

/**
 * Guest Guard Component
 * Protects routes that should only be accessible to unauthenticated users
 */
const GuestGuard = ({ children, fallback }) => {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status !== 'loading' && session) {
      // Sanitize: coerce to string, require leading '/', block protocol-relative '//'
      const raw = Array.isArray(router.query.returnUrl) ? router.query.returnUrl[0] : router.query.returnUrl
      const safe = (typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//')) ? raw : '/'
      router.push(safe)
    }
  }, [session, status, router])

  if (status === 'loading' || session) {
    return fallback
  }

  return children
}

export default GuestGuard
