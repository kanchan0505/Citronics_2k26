import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { signIn } from 'next-auth/react'

// MUI
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import { alpha } from '@mui/material/styles'

// Icons
import { IconEye, IconEyeOff, IconInfoCircle, IconPhone, IconUser, IconMail, IconLock, IconBuilding, IconMapPin, IconUserCheck, IconCircleCheckFilled } from '@tabler/icons-react'

// Config & helpers
import themeConfig from 'src/configs/themeConfig'
import { useAppPalette } from 'src/components/palette'
import { lookupPhone, registerUser, verifyUser, setExistingUser } from 'src/store/slices/checkoutSlice'

/* ═══════════════════════════════════════════════════════════════════════════
 *  Animated character sub-components (adapted from 21st.dev)
 * ═════════════════════════════════════════════════════════════════════════ */

const EyeBall = ({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = 'white', pupilColor = 'black', isBlinking = false, forceLookX, forceLookY }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const eyeRef = useRef(null)

  useEffect(() => {
    const handler = e => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  const getPupilPos = () => {
    if (!eyeRef.current) return { x: 0, y: 0 }
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY }
    const rect = eyeRef.current.getBoundingClientRect()
    const dx = mousePos.x - (rect.left + rect.width / 2)
    const dy = mousePos.y - (rect.top + rect.height / 2)
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance)
    const angle = Math.atan2(dy, dx)
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
  }

  const pos = getPupilPos()

  return (
    <div
      ref={eyeRef}
      style={{
        width: size, height: isBlinking ? 2 : size,
        backgroundColor: eyeColor, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', transition: 'height 0.15s ease'
      }}
    >
      {!isBlinking && (
        <div style={{
          width: pupilSize, height: pupilSize,
          backgroundColor: pupilColor, borderRadius: '50%',
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: 'transform 0.1s ease-out'
        }} />
      )}
    </div>
  )
}

const Pupil = ({ size = 12, maxDistance = 5, pupilColor = '#2D2D2D', forceLookX, forceLookY }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  const getPos = () => {
    if (!ref.current) return { x: 0, y: 0 }
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY }
    const rect = ref.current.getBoundingClientRect()
    const dx = mousePos.x - (rect.left + rect.width / 2)
    const dy = mousePos.y - (rect.top + rect.height / 2)
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance)
    const angle = Math.atan2(dy, dx)
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
  }

  const pos = getPos()

  return (
    <div
      ref={ref}
      style={{
        width: size, height: size,
        backgroundColor: pupilColor, borderRadius: '50%',
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: 'transform 0.1s ease-out'
      }}
    />
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Validation helpers
 * ═════════════════════════════════════════════════════════════════════════ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\d{10}$/

function validateField(name, value) {
  const v = (value || '').trim()
  switch (name) {
    case 'name':
      if (!v) return 'Full name is required'
      if (v.length < 2) return 'Name must be at least 2 characters'
      return ''
    case 'email':
      if (!v) return 'Email is required'
      if (!EMAIL_RE.test(v)) return 'Enter a valid email address'
      return ''
    case 'phone':
      if (!v) return 'Phone number is required'
      if (!PHONE_RE.test(v.replace(/[\s\-+()]/g, '').slice(-10))) return 'Enter a valid 10-digit phone number'
      return ''
    case 'password':
      if (!v) return 'Password is required'
      if (v.length < 6) return 'Password must be at least 6 characters'
      return ''
    case 'college':
      if (!v) return 'College name is required'
      if (v.length < 2) return 'College name must be at least 2 characters'
      return ''
    case 'city':
      if (!v) return 'City is required'
      if (v.length < 2) return 'City must be at least 2 characters'
      return ''
    default:
      return ''
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Login / Register Page
 * ═════════════════════════════════════════════════════════════════════════ */

const LoginPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const c = useAppPalette()

  // Sanitize returnUrl: must be a string, start with '/', and not be protocol-relative (//)
  const rawReturn = router.query.returnUrl
  const returnUrl = (typeof rawReturn === 'string' && rawReturn.startsWith('/') && !rawReturn.startsWith('//')) ? rawReturn : '/'

  // ── Mode: 'register' (default) or 'login' ──
  const [mode, setMode] = useState('register')

  // ── Form state ──
  const [form, setForm] = useState({
    phone: '',
    name: '',
    email: '',
    password: '',
    college: '',
    city: ''
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  // ── Phone lookup state ──
  const [phoneLookup, setPhoneLookup] = useState(null)
  const [lookingUpPhone, setLookingUpPhone] = useState(false)
  const phoneLookupTimer = useRef(null)

  const isExistingUser = mode === 'login' || phoneLookup?.exists

  // ── Character animation state ──
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false)
  const [isBlackBlinking, setIsBlackBlinking] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false)
  const [isPurplePeeking, setIsPurplePeeking] = useState(false)
  const purpleRef = useRef(null)
  const blackRef = useRef(null)
  const yellowRef = useRef(null)
  const orangeRef = useRef(null)

  // Mouse tracking for body sway
  useEffect(() => {
    const handler = e => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  // Purple blink — track all timeouts via ref to avoid leaks on unmount
  const purpleBlinkTimers = useRef([])
  useEffect(() => {
    const timers = purpleBlinkTimers.current
    const schedule = () => {
      const t1 = setTimeout(() => {
        setIsPurpleBlinking(true)
        const t2 = setTimeout(() => { setIsPurpleBlinking(false); schedule() }, 150)
        timers.push(t2)
      }, Math.random() * 4000 + 3000)
      timers.push(t1)
    }
    schedule()
    return () => { timers.forEach(clearTimeout); timers.length = 0 }
  }, [])

  // Black blink — same pattern
  const blackBlinkTimers = useRef([])
  useEffect(() => {
    const timers = blackBlinkTimers.current
    const schedule = () => {
      const t1 = setTimeout(() => {
        setIsBlackBlinking(true)
        const t2 = setTimeout(() => { setIsBlackBlinking(false); schedule() }, 150)
        timers.push(t2)
      }, Math.random() * 4000 + 3000)
      timers.push(t1)
    }
    schedule()
    return () => { timers.forEach(clearTimeout); timers.length = 0 }
  }, [])

  // Look at each other briefly when user starts typing
  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true)
      const t = setTimeout(() => setIsLookingAtEachOther(false), 800)
      return () => clearTimeout(t)
    } else {
      setIsLookingAtEachOther(false)
    }
  }, [isTyping])

  // Purple peeks when password is revealed
  useEffect(() => {
    if (form.password.length > 0 && showPassword) {
      const t = setTimeout(() => {
        setIsPurplePeeking(true)
        setTimeout(() => setIsPurplePeeking(false), 800)
      }, Math.random() * 3000 + 2000)
      return () => clearTimeout(t)
    } else {
      setIsPurplePeeking(false)
    }
  }, [form.password, showPassword, isPurplePeeking])

  const calcPos = ref => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 }
    const rect = ref.current.getBoundingClientRect()
    const dx = mousePos.x - (rect.left + rect.width / 2)
    const dy = mousePos.y - (rect.top + rect.height / 3)
    return {
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120))
    }
  }

  const purplePos = calcPos(purpleRef)
  const blackPos  = calcPos(blackRef)
  const yellowPos = calcPos(yellowRef)
  const orangePos = calcPos(orangeRef)
  const passwordVisible = form.password.length > 0 && showPassword
  const passwordHidden  = form.password.length > 0 && !showPassword

  // ── Live phone lookup (only in register mode) ──
  useEffect(() => {
    if (mode === 'login') return
    setPhoneLookup(null)
    if (phoneLookupTimer.current) clearTimeout(phoneLookupTimer.current)

    const cleaned = form.phone.trim().replace(/[\s\-+()]/g, '').slice(-10)
    if (!PHONE_RE.test(cleaned)) return

    phoneLookupTimer.current = setTimeout(async () => {
      setLookingUpPhone(true)
      try {
        const result = await dispatch(lookupPhone(form.phone))
        if (lookupPhone.fulfilled.match(result) && result.payload.exists) {
          setPhoneLookup({ exists: true, name: result.payload.data?.name || '' })
        } else {
          setPhoneLookup({ exists: false })
        }
      } catch { /* ignore */ }
      setLookingUpPhone(false)
    }, 600)

    return () => clearTimeout(phoneLookupTimer.current)
  }, [form.phone, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──
  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (serverError) setServerError('')
  }

  const validateAll = () => {
    const newErrors = {}
    const fields = isExistingUser
      ? (mode === 'login' ? ['phone', 'password'] : ['phone', 'password'])
      : ['name', 'email', 'phone', 'password', 'college', 'city']
    let hasError = false
    for (const field of fields) {
      const err = validateField(field, form[field])
      if (err) { newErrors[field] = err; hasError = true }
    }
    setErrors(newErrors)
    return !hasError
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateAll()) return

    setServerError('')
    setLoading(true)
    const cleaned = form.phone.trim().replace(/[\s\-+()]/g, '').slice(-10)

    try {
      // ── Existing user path — verify password then sign in ──
      if (isExistingUser) {
        const result = await dispatch(verifyUser({ phone: cleaned, password: form.password }))
        if (verifyUser.fulfilled.match(result)) {
          const signInResult = await signIn('credentials', {
            email: cleaned,
            password: form.password,
            redirect: false
          })
          if (signInResult?.ok) {
            dispatch(setExistingUser({ userId: result.payload.userId }))
            router.push(returnUrl)
          } else {
            setServerError('Login failed. Please try again.')
          }
        } else {
          setServerError(result.payload || 'Incorrect password. Please try again.')
        }
        setLoading(false)
        return
      }

      // ── New user path — register then sign in ──
      const result = await dispatch(registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        college: form.college.trim(),
        city: form.city.trim()
      }))

      if (registerUser.fulfilled.match(result)) {
        const signInResult = await signIn('credentials', {
          email: form.email.trim(),
          password: form.password,
          redirect: false
        })
        if (signInResult?.ok) {
          dispatch(setExistingUser({ userId: result.payload.userId }))
          router.push(returnUrl)
        } else {
          setServerError('Account created but auto-login failed. Please refresh and try again.')
        }
      } else if (registerUser.rejected.match(result)) {
        const payload = result.payload
        if (payload?.code === 'PHONE_EXISTS') {
          setPhoneLookup({ exists: true, name: '' })
          setErrors({})
          setServerError('This phone number is already registered. Enter your password to login.')
          setLoading(false)
          return
        }
        if (payload?.code === 'EMAIL_EXISTS') {
          setErrors(prev => ({ ...prev, email: payload.message || 'This email is already registered.' }))
          setLoading(false)
          return
        }
        setServerError(typeof payload === 'string' ? payload : payload?.message || 'Registration failed')
      }
    } catch (_err) {
      setServerError('An unexpected error occurred. Please try again.')
    }
    setLoading(false)
  }

  // ── Shared TextField sx ──
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      fontSize: '0.9rem',
      '& fieldset': { borderColor: alpha(c.divider, 0.5), transition: 'border-color 0.2s ease' },
      '&:hover fieldset': { borderColor: alpha(c.primary, 0.4) },
      '&.Mui-focused fieldset': { borderColor: c.primary, borderWidth: '1.5px' }
    },
    '& .MuiInputLabel-root': { fontSize: '0.85rem', fontWeight: 500 }
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'stretch' }}>
        {/* ══ LEFT — brand + animated characters (desktop only) ══ */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flex: '0 0 45%',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: `linear-gradient(145deg, ${c.primary} 0%, ${c.primaryDark} 60%, ${alpha(c.primaryDark, 0.85)} 100%)`,
            p: '3rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background blobs */}
          <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)' }} />

          {/* Logo */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box component='img' src='/logo/citronics2.png' alt={themeConfig.templateName}
              sx={{ height: 34, width: 'auto', filter: 'brightness(0) invert(1)' }} />
          </Box>

          {/* Characters stage */}
          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 420 }}>
            <div style={{ position: 'relative', width: 420, height: 360 }}>

              {/* Purple tall rectangle — back */}
              <div ref={purpleRef} style={{ position: 'absolute', bottom: 0, left: 50, width: 160, height: passwordVisible ? 420 : (isTyping || passwordHidden) ? 400 : 360, backgroundColor: '#6C3FF5', borderRadius: '10px 10px 0 0', zIndex: 1, transition: 'all 0.7s ease-in-out', transform: passwordVisible ? 'skewX(0deg)' : (isTyping || passwordHidden) ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(35px)` : `skewX(${purplePos.bodySkew || 0}deg)`, transformOrigin: 'bottom center' }}>
                <div style={{ position: 'absolute', left: passwordVisible ? 18 : isLookingAtEachOther ? 50 : 40 + purplePos.faceX, top: passwordVisible ? 32 : isLookingAtEachOther ? 60 : 36 + purplePos.faceY, display: 'flex', gap: 24, transition: 'all 0.7s ease-in-out' }}>
                  <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor='white' pupilColor='#2D2D2D' isBlinking={isPurpleBlinking} forceLookX={passwordVisible ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined} forceLookY={passwordVisible ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
                  <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor='white' pupilColor='#2D2D2D' isBlinking={isPurpleBlinking} forceLookX={passwordVisible ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined} forceLookY={passwordVisible ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
                </div>
              </div>

              {/* Black shorter rectangle — middle */}
              <div ref={blackRef} style={{ position: 'absolute', bottom: 0, left: 198, width: 108, height: 290, backgroundColor: '#2D2D2D', borderRadius: '8px 8px 0 0', zIndex: 2, transition: 'all 0.7s ease-in-out', transform: passwordVisible ? 'skewX(0deg)' : isLookingAtEachOther ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(18px)` : (isTyping || passwordHidden) ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)` : `skewX(${blackPos.bodySkew || 0}deg)`, transformOrigin: 'bottom center' }}>
                <div style={{ position: 'absolute', left: passwordVisible ? 8 : isLookingAtEachOther ? 28 : 22 + blackPos.faceX, top: passwordVisible ? 26 : isLookingAtEachOther ? 10 : 28 + blackPos.faceY, display: 'flex', gap: 20, transition: 'all 0.7s ease-in-out' }}>
                  <EyeBall size={15} pupilSize={6} maxDistance={4} eyeColor='white' pupilColor='#1a1a2e' isBlinking={isBlackBlinking} forceLookX={passwordVisible ? -4 : isLookingAtEachOther ? 0 : undefined} forceLookY={passwordVisible ? -4 : isLookingAtEachOther ? -4 : undefined} />
                  <EyeBall size={15} pupilSize={6} maxDistance={4} eyeColor='white' pupilColor='#1a1a2e' isBlinking={isBlackBlinking} forceLookX={passwordVisible ? -4 : isLookingAtEachOther ? 0 : undefined} forceLookY={passwordVisible ? -4 : isLookingAtEachOther ? -4 : undefined} />
                </div>
              </div>

              {/* Orange semi-circle — front left */}
              <div ref={orangeRef} style={{ position: 'absolute', bottom: 0, left: 0, width: 220, height: 180, backgroundColor: '#FF9B6B', borderRadius: '110px 110px 0 0', zIndex: 3, transition: 'all 0.7s ease-in-out', transform: passwordVisible ? 'skewX(0deg)' : `skewX(${orangePos.bodySkew || 0}deg)`, transformOrigin: 'bottom center' }}>
                <div style={{ position: 'absolute', left: passwordVisible ? 46 : 76 + (orangePos.faceX || 0), top: passwordVisible ? 78 : 82 + (orangePos.faceY || 0), display: 'flex', gap: 28, transition: 'all 0.2s ease-out' }}>
                  <Pupil size={11} maxDistance={5} pupilColor='#2D2D2D' forceLookX={passwordVisible ? -5 : undefined} forceLookY={passwordVisible ? -4 : undefined} />
                  <Pupil size={11} maxDistance={5} pupilColor='#2D2D2D' forceLookX={passwordVisible ? -5 : undefined} forceLookY={passwordVisible ? -4 : undefined} />
                </div>
              </div>

              {/* Yellow rounded rectangle — front right */}
              <div ref={yellowRef} style={{ position: 'absolute', bottom: 0, left: 272, width: 130, height: 210, backgroundColor: '#E8D754', borderRadius: '65px 65px 0 0', zIndex: 4, transition: 'all 0.7s ease-in-out', transform: passwordVisible ? 'skewX(0deg)' : `skewX(${yellowPos.bodySkew || 0}deg)`, transformOrigin: 'bottom center' }}>
                <div style={{ position: 'absolute', left: passwordVisible ? 18 : 46 + (yellowPos.faceX || 0), top: passwordVisible ? 32 : 36 + (yellowPos.faceY || 0), display: 'flex', gap: 18, transition: 'all 0.2s ease-out' }}>
                  <Pupil size={11} maxDistance={5} pupilColor='#2D2D2D' forceLookX={passwordVisible ? -5 : undefined} forceLookY={passwordVisible ? -4 : undefined} />
                  <Pupil size={11} maxDistance={5} pupilColor='#2D2D2D' forceLookX={passwordVisible ? -5 : undefined} forceLookY={passwordVisible ? -4 : undefined} />
                </div>
                <div style={{ position: 'absolute', left: passwordVisible ? 8 : 36 + (yellowPos.faceX || 0), top: passwordVisible ? 80 : 82 + (yellowPos.faceY || 0), width: 72, height: 4, backgroundColor: '#2D2D2D', borderRadius: 4, transition: 'all 0.2s ease-out' }} />
              </div>

            </div>
          </Box>

          {/* Ticket notice + footer links */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ mb: 2.5, p: 2, borderRadius: '12px', bgcolor: alpha('#fff', 0.1), border: `1px solid ${alpha('#fff', 0.15)}`, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <IconInfoCircle size={16} style={{ color: alpha('#fff', 0.9), flexShrink: 0, marginTop: 2 }} />
              <Typography variant='body2' sx={{ color: alpha('#fff', 0.9), fontSize: '0.8rem', lineHeight: 1.6, fontWeight: 500 }}>
                Tickets will be sent to your registered email or phone. Please provide correct details.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {['Privacy Policy', 'Terms of Service', 'Contact'].map(link => (
                <Typography key={link} variant='caption' sx={{ color: alpha('#fff', 0.5), cursor: 'pointer', '&:hover': { color: alpha('#fff', 0.9) }, transition: 'color 0.2s' }}>{link}</Typography>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ══ RIGHT — form panel ══ */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 2.5, sm: 4, md: 5 },
            bgcolor: 'background.default',
            minHeight: '100dvh',
            pb: { xs: 'calc(80px + env(safe-area-inset-bottom, 0px))', md: 5 }
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 440 }}>

            {/* Mobile logo */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 4 }}>
              <Box component='img' src='/logo/citronics2.png' alt={themeConfig.templateName} sx={{ height: 30, width: 'auto' }} />
            </Box>

            {/* Header */}
            <Box sx={{ mb: 3 }}>
              <Typography variant='h5' fontWeight={800} sx={{ color: c.textPrimary, mb: 0.5 }}>
                {isExistingUser ? 'Welcome back!' : 'Create your account'}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {isExistingUser ? 'Enter your phone and password to continue' : 'Fill in the details below to get started'}
              </Typography>
            </Box>

            {/* Mobile-only ticket notice */}
            <Box
              sx={{
                display: { xs: 'flex', md: 'none' },
                mb: 2.5,
                p: 1.25,
                borderRadius: '10px',
                bgcolor: alpha(c.warning, 0.08),
                border: `1px solid ${alpha(c.warning, 0.18)}`,
                alignItems: 'flex-start',
                gap: 1
              }}
            >
              <IconInfoCircle size={16} style={{ color: c.warning, flexShrink: 0, marginTop: 1 }} />
              <Typography variant='body2' sx={{ color: c.textSecondary, fontWeight: 500, fontSize: '0.78rem', lineHeight: 1.5 }}>
                Tickets will be sent to your registered email or phone. Provide correct details.
              </Typography>
            </Box>

            {/* Error */}
            <Collapse in={!!serverError}>
              <Alert severity='error' sx={{ mb: 2.5, borderRadius: '10px' }} onClose={() => setServerError('')}>
                {serverError}
              </Alert>
            </Collapse>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                {/* Phone — always full width */}
                <Box>
                  <TextField
                    fullWidth
                    label='Phone Number'
                    name='phone'
                    value={form.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone || ' '}
                    disabled={loading}
                    autoFocus
                    placeholder='10-digit mobile number'
                    sx={fieldSx}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <IconPhone size={17} color={errors.phone ? c.error : c.textDisabled} />
                        </InputAdornment>
                      ),
                      endAdornment: lookingUpPhone ? (
                        <InputAdornment position='end'>
                          <CircularProgress size={15} sx={{ color: c.textDisabled }} />
                        </InputAdornment>
                      ) : phoneLookup?.exists ? (
                        <InputAdornment position='end'>
                          <IconCircleCheckFilled size={17} color={c.success} />
                        </InputAdornment>
                      ) : undefined
                    }}
                  />
                  {phoneLookup?.exists && mode !== 'login' && (
                    <Box sx={{ mt: -0.5, mb: 0.5, px: 1.5, py: 0.75, borderRadius: '8px', bgcolor: alpha(c.success, 0.07), border: `1px solid ${alpha(c.success, 0.18)}` }}>
                      <Typography variant='body2' sx={{ fontSize: '0.76rem', fontWeight: 600, color: c.success, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconUserCheck size={13} />
                        Account found{phoneLookup.name ? ` — ${phoneLookup.name}` : ''}. Enter your password below.
                      </Typography>
                    </Box>
                  )}
                </Box>

                {isExistingUser ? (
                  /* Existing user: password only */
                  <TextField
                    fullWidth
                    label='Password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter your password'
                    value={form.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password || ' '}
                    disabled={loading}
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <IconLock size={17} color={errors.password ? c.error : c.textDisabled} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton size='small' onClick={() => setShowPassword(!showPassword)} edge='end'>
                            {showPassword ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                ) : (
                  /* New user: 2-column grid on sm+ */
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                      fullWidth
                      label='Full Name'
                      name='name'
                      value={form.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name || ' '}
                      disabled={loading}
                      sx={fieldSx}
                      InputProps={{ startAdornment: <InputAdornment position='start'><IconUser size={17} color={errors.name ? c.error : c.textDisabled} /></InputAdornment> }}
                    />
                    <TextField
                      fullWidth
                      label='Email Address'
                      name='email'
                      type='email'
                      placeholder='you@example.com'
                      value={form.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email || ' '}
                      disabled={loading}
                      sx={fieldSx}
                      InputProps={{ startAdornment: <InputAdornment position='start'><IconMail size={17} color={errors.email ? c.error : c.textDisabled} /></InputAdornment> }}
                    />
                    <TextField
                      fullWidth
                      label='Password'
                      name='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Min 6 characters'
                      value={form.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password || ' '}
                      disabled={loading}
                      sx={fieldSx}
                      InputProps={{
                        startAdornment: <InputAdornment position='start'><IconLock size={17} color={errors.password ? c.error : c.textDisabled} /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton size='small' onClick={() => setShowPassword(!showPassword)} edge='end'>
                              {showPassword ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    <TextField
                      fullWidth
                      label='College'
                      name='college'
                      value={form.college}
                      onChange={handleChange}
                      error={!!errors.college}
                      helperText={errors.college || ' '}
                      disabled={loading}
                      sx={fieldSx}
                      InputProps={{ startAdornment: <InputAdornment position='start'><IconBuilding size={17} color={errors.college ? c.error : c.textDisabled} /></InputAdornment> }}
                    />
                    <TextField
                      fullWidth
                      label='City'
                      name='city'
                      value={form.city}
                      onChange={handleChange}
                      error={!!errors.city}
                      helperText={errors.city || ' '}
                      disabled={loading}
                      sx={{ ...fieldSx, gridColumn: { xs: '1', sm: '1 / -1' } }}
                      InputProps={{ startAdornment: <InputAdornment position='start'><IconMapPin size={17} color={errors.city ? c.error : c.textDisabled} /></InputAdornment> }}
                    />
                  </Box>
                )}

                {/* Submit */}
                <Button
                  fullWidth
                  type='submit'
                  variant='contained'
                  size='large'
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    mt: 0.5,
                    boxShadow: `0 4px 16px ${c.primaryA30}`,
                    '&:hover': { boxShadow: `0 6px 22px ${c.primaryA40}` }
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color='inherit' />
                      {isExistingUser ? 'Signing in...' : 'Creating account...'}
                    </Box>
                  ) : isExistingUser ? 'Sign In' : 'Register & Continue'}
                </Button>
              </Box>
            </form>

            {/* Toggle mode */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              {isExistingUser ? (
                <Typography variant='body2' color='text.secondary'>
                  Don&apos;t have an account?{' '}
                  <Box
                    component='button'
                    type='button'
                    onClick={() => { setMode('register'); setPhoneLookup(null); setErrors({}); setServerError('') }}
                    sx={{
                      all: 'unset', display: 'inline', cursor: 'pointer',
                      color: 'primary.main', fontWeight: 700, fontSize: 'inherit', fontFamily: 'inherit',
                      '&:hover, &:focus-visible': { textDecoration: 'underline' },
                      '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2, borderRadius: '2px' }
                    }}
                  >
                    Create Account
                  </Box>
                </Typography>
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  Already have an account?{' '}
                  <Box
                    component='button'
                    type='button'
                    onClick={() => { setMode('login'); setErrors({}); setServerError('') }}
                    sx={{
                      all: 'unset', display: 'inline', cursor: 'pointer',
                      color: 'primary.main', fontWeight: 700, fontSize: 'inherit', fontFamily: 'inherit',
                      '&:hover, &:focus-visible': { textDecoration: 'underline' },
                      '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2, borderRadius: '2px' }
                    }}
                  >
                    Sign In
                  </Box>
                </Typography>
              )}
            </Box>

          </Box>
        </Box>
    </Box>
  )
}

LoginPage.getLayout = page => page
LoginPage.guestGuard = true
LoginPage.authGuard = false

export default LoginPage
