import { useState } from 'react'
import { useRouter } from 'next/router'

// MUI
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CustomTextField from 'src/components/mui/TextField'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import { alpha } from '@mui/material/styles'

// Icons & config
import Icon from 'src/components/Icon'
import themeConfig from 'src/configs/themeConfig'
import { useAppPalette } from 'src/components/palette'

const ResetPasswordPage = () => {
  const router = useRouter()
  const c = useAppPalette()
  const { token } = router.query

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverMsg, setServerMsg] = useState('')
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!password) errs.password = 'Password is required'
    else if (password.length < 6) errs.password = 'Must be at least 6 characters'
    if (!confirmPassword) errs.confirm = 'Please confirm your password'
    else if (password !== confirmPassword) errs.confirm = 'Passwords do not match'
    setErrors(errs)

    return Object.keys(errs).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setServerMsg('')
    setServerError('')

    if (!validate()) return

    if (!token) {
      setServerError('Invalid reset link. Please request a new one from the forgot-password page.')

      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await res.json()

      if (res.ok) {
        setServerMsg(data.message)
        // Redirect to login after 3 seconds
        setTimeout(() => router.push('/login'), 3000)
      } else {
        setServerError(data.error || 'Something went wrong.')
      }
    } catch {
      setServerError('Network error. Please try again.')
    }

    setLoading(false)
  }

  // No token in URL
  if (router.isReady && !token) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: { xs: 2.5, sm: 4 } }}>
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: '14px', mx: 'auto', mb: 3,
            bgcolor: alpha(c.error, 0.1),
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icon icon='tabler:link-off' fontSize={28} style={{ color: c.error }} />
          </Box>
          <Typography variant='h5' fontWeight={800} sx={{ mb: 1 }}>Invalid Reset Link</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            This link is missing a reset token. Please request a new password reset.
          </Typography>
          <Button variant='contained' onClick={() => router.push('/forgot-password')}
            sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none' }}
          >
            Request New Link
          </Button>
        </Box>
      </Box>
    )
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
            <Icon icon='tabler:key' fontSize={28} style={{ color: c.primary }} />
          </Box>
        </Box>

        {/* Header */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant='h5' fontWeight={800} sx={{ color: c.textPrimary, mb: 0.5 }}>
            Reset Password
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Choose a new password for your account.
          </Typography>
        </Box>

        {/* Success */}
        <Collapse in={!!serverMsg}>
          <Alert severity='success' sx={{ mb: 2.5, borderRadius: '10px' }}>
            {serverMsg} Redirecting to login...
          </Alert>
        </Collapse>

        {/* Error */}
        <Collapse in={!!serverError}>
          <Alert severity='error' sx={{ mb: 2.5, borderRadius: '10px' }} onClose={() => setServerError('')}>
            {serverError}
          </Alert>
        </Collapse>

        {/* Form — hide after success */}
        {!serverMsg && (
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <CustomTextField
                fullWidth label='New Password' type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })) }}
                error={!!errors.password} helperText={errors.password || ' '}
                disabled={loading} autoFocus placeholder='Min 6 characters'
                InputProps={{
                  startAdornment: <InputAdornment position='start'><Icon icon='tabler:lock' fontSize={17} color={errors.password ? c.error : c.textDisabled} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton size='small' onClick={() => setShowPassword(!showPassword)} edge='end'>
                        {showPassword ? <Icon icon='tabler:eye-off' fontSize={17} /> : <Icon icon='tabler:eye' fontSize={17} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <CustomTextField
                fullWidth label='Confirm Password' type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); if (errors.confirm) setErrors(p => ({ ...p, confirm: '' })) }}
                error={!!errors.confirm} helperText={errors.confirm || ' '}
                disabled={loading} placeholder='Re-enter your password'
                InputProps={{
                  startAdornment: <InputAdornment position='start'><Icon icon='tabler:lock-check' fontSize={17} color={errors.confirm ? c.error : c.textDisabled} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton size='small' onClick={() => setShowConfirm(!showConfirm)} edge='end'>
                        {showConfirm ? <Icon icon='tabler:eye-off' fontSize={17} /> : <Icon icon='tabler:eye' fontSize={17} />}
                      </IconButton>
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
                    Resetting...
                  </Box>
                ) : 'Reset Password'}
              </Button>
            </Box>
          </form>
        )}

        {/* Request new link */}
        {serverError && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant='body2' color='text.secondary'>
              Need a new link?{' '}
              <Box
                component='button' type='button'
                onClick={() => router.push('/forgot-password')}
                sx={{
                  all: 'unset', display: 'inline', cursor: 'pointer',
                  color: 'primary.main', fontWeight: 700, fontSize: 'inherit', fontFamily: 'inherit',
                  '&:hover, &:focus-visible': { textDecoration: 'underline' }
                }}
              >
                Request Password Reset
              </Box>
            </Typography>
          </Box>
        )}

      </Box>
    </Box>
  )
}

ResetPasswordPage.getLayout = page => page
ResetPasswordPage.guestGuard = true
ResetPasswordPage.authGuard = false

export default ResetPasswordPage
