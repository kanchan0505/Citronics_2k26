import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useAppPalette } from 'src/components/palette'
import Icon from 'src/components/Icon'
import axios from 'axios'

const MotionBox = motion(Box)

const DJ_DEPARTMENT_ID = 17

function getEventImage(event) {
  if (event?.images && Array.isArray(event.images) && event.images.length > 0) {
    const img = event.images[0]
    return typeof img === 'string' ? img : img?.url || null
  }
  return null
}

export default function DJHighlightSection() {
  const c = useAppPalette()
  const router = useRouter()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    axios
      .get(`/api/events?departmentId=${DJ_DEPARTMENT_ID}&limit=1`)
      .then(res => {
        if (cancelled) return
        const events = res.data?.data || []
        if (events.length > 0) setEvent(events[0])
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Don't render anything if no DJ event found
  if (!loading && !event) return null

  const imageUrl = event ? getEventImage(event) : null
  const accent = c.primary

  return (
    <Box
      component='section'
      aria-label='DJ Evening Highlight'
      sx={{
        py: { xs: 6, md: 10 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle background glow */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, ${alpha(accent, 0.06)} 0%, transparent 70%)`,
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth='xs' sx={{ position: 'relative', zIndex: 1, px: { xs: 5, sm: 4 } }}>
        {/* Section heading */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          sx={{ textAlign: 'center', mb: { xs: 3, md: 5 } }}
        >
          <Typography
            variant='overline'
            sx={{
              color: accent,
              fontWeight: 800,
              letterSpacing: 3,
              fontSize: { xs: '0.7rem', md: '0.8rem' },
              mb: 1,
              display: 'block'
            }}
          >
            Don&apos;t Miss
          </Typography>
          <Typography
            variant='h3'
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: c.textPrimary,
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
              lineHeight: 1.15
            }}
          >
            The DJ Evening
          </Typography>
        </MotionBox>

        {/* Event card */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
          sx={{
            borderRadius: { xs: '16px', md: '20px' },
            overflow: 'hidden',
            border: `1.5px solid ${alpha(accent, 0.15)}`,
            bgcolor: c.bgPaper,
            boxShadow: `0 8px 40px ${alpha(accent, 0.08)}`
          }}
        >
          {/* Image */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: { xs: '3 / 4', md: '3 / 4' },
              bgcolor: alpha(accent, 0.04),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {loading ? (
              <Skeleton variant='rectangular' sx={{ width: '100%', height: '100%' }} />
            ) : imageUrl ? (
              <Box
                component='img'
                src={imageUrl}
                alt={event?.name || 'DJ Evening'}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            ) : (
              <Icon
                icon='tabler:music'
                fontSize={72}
                style={{ color: alpha(accent, 0.2) }}
              />
            )}
          </Box>

          {/* Bottom bar with name + button */}
          <Box
            sx={{
              display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
              px: { xs: 2.5, md: 4 },
              py: { xs: 2.5, md: 3 }
            }}
          >
            {loading ? (
              <>
                <Skeleton width={200} height={32} />
                <Skeleton width={140} height={44} sx={{ borderRadius: '10px' }} />
              </>
            ) : (
              <>
                <Typography
                  variant='h5'
                  sx={{
                    fontWeight: 800,
                    color: c.textPrimary,
                    fontSize: { xs: '1.15rem', md: '1.4rem' },
                    letterSpacing: '-0.01em'
                  }}
                >
                  {event?.name || 'DJ Evening'}
                </Typography>

                <Typography
                  variant='caption'
                  sx={{
                    color: alpha(accent, 0.7),
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  Passes will be sold offline
                </Typography>

                <Button
                  variant='contained'
                  endIcon={<Icon icon='tabler:arrow-right' fontSize={18} />}
                  onClick={() => router.push(`/events/${event?.id}`)}
                  sx={{
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    px: { xs: 3, md: 4 },
                    py: 1.3,
                    bgcolor: accent,
                    boxShadow: `0 4px 16px ${alpha(accent, 0.3)}`,
                    flexShrink: 0,
                    '&:hover': {
                      bgcolor: alpha(accent, 0.9),
                      boxShadow: `0 6px 24px ${alpha(accent, 0.4)}`
                    },
                    transition: 'all 0.25s ease'
                  }}
                >
                  View Details
                </Button>
              </>
            )}
          </Box>
        </MotionBox>
      </Container>
    </Box>
  )
}
