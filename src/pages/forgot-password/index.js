import { useState } from 'react'
import { useRouter } from 'next/router'

// MUI
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CustomTextField from 'src/components/mui/TextField'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import { alpha } from '@mui/material/styles'

// Icons & config
import Icon from 'src/components/Icon'
import themeConfig from 'src/configs/themeConfig'
import { useAppPalette } from 'src/components/palette'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ForgotPasswordPage = () => {
  const router = useRouter()
  const c = useAppPalette()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [serverMsg, setServerMsg] = useState('')
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setServerMsg('')
    setServerError('')

    const trimmed = email.trim()
    if (!trimmed) { setError('Email is required'); return }
    if (!EMAIL_RE.test(trimmed)) { setError('Enter a valid email address'); return }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed })
      })

      const data = await res.json()

      if (res.ok) {
        setServerMsg(data.message)
      } else {
        setServerError(data.error || 'Something went wrong.')
      }
    } catch {
      setServerError('Network error. Please try again.')
    }

    setLoading(false)
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: { xs: 2.5, sm: 4 } }}>
      <Box sx={{ width: '100%', maxWidth: 440 }}>

        {/* Back to login */}
        <Box sx={{ mb: 3 }}>
          <Button
            onClick={() => router.push('/login')}
            startIcon={<Icon icon='tabler:arrow-left' fontSize={15} />}
            sx={{
              color: c.textSecondary, fontWeight: 600, fontSize: '0.8rem',
              textTransform: 'none', p: 0, minWidth: 0,
              '&:hover': { color: c.primary, bgcolor: 'transparent' }
            }}
          >
            Back to Login
          </Button>
        </Box>

        {/* Logo (mobile) */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mb: 4 }}>
          <Box component='img' src='/logo/citronics2.png' alt={themeConfig.templateName} sx={{ height: 30, width: 'auto' }} />
        </Box>

        {/* Icon */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: '14px',
            bgcolor: alpha(c.primary, 0.1),
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icon icon='tabler:lock-question' fontSize={28} style={{ color: c.primary }} />
          </Box>
        </Box>

        {/* Header */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant='h5' fontWeight={800} sx={{ color: c.textPrimary, mb: 0.5 }}>
            Forgot Password?
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Enter your email and we&apos;ll send you a link to reset your password.
          </Typography>
        </Box>

        {/* Success message */}
        <Collapse in={!!serverMsg}>
          <Alert severity='success' sx={{ mb: 2.5, borderRadius: '10px' }}>
            {serverMsg}
          </Alert>
        </Collapse>

        {/* Error message */}
        <Collapse in={!!serverError}>
          <Alert severity='error' sx={{ mb: 2.5, borderRadius: '10px' }} onClose={() => setServerError('')}>
            {serverError}
          </Alert>
        </Collapse>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <CustomTextField
            fullWidth
            label='Email Address'
            value={email}
            onChange={e => { setEmail(e.target.value); if (error) setError(''); if (serverError) setServerError('') }}
            error={!!error}
            helperText={error || ' '}
            disabled={loading}
            autoFocus
            placeholder='you@example.com'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Icon icon='tabler:mail' fontSize={17} color={error ? c.error : c.textDisabled} />
                </InputAdornment>
              )
            }}
          />
          <Button
            fullWidth type='submit' variant='contained' size='large' disabled={loading}
            sx={{
              py: 1.5, borderRadius: '12px', fontWeight: 700,
              textTransform: 'none', fontSize: '0.95rem', mt: 0.5,
              boxShadow: `0 4px 16px ${c.primaryA30}`,
              '&:hover': { boxShadow: `0 6px 22px ${c.primaryA40}` }
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color='inherit' />
                Sending...
              </Box>
            ) : 'Send Reset Link'}
          </Button>
        </form>

        {/* Back to sign in */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary'>
            Remember your password?{' '}
            <Box
              component='button' type='button'
              onClick={() => router.push('/login')}
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
        </Box>

      </Box>
    </Box>
  )
}

ForgotPasswordPage.getLayout = page => page
ForgotPasswordPage.guestGuard = true
ForgotPasswordPage.authGuard = false

export default ForgotPasswordPage
