import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Skeleton from '@mui/material/Skeleton'
import useMediaQuery from '@mui/material/useMediaQuery'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { alpha } from '@mui/material/styles'
import { useAppPalette } from 'src/components/palette'
import { motion } from 'framer-motion'
import Icon from 'src/components/Icon'
import { fetchEventById, clearCurrentEvent } from 'src/store/slices/eventsSlice'
import { addToCart } from 'src/store/slices/cartSlice'
import { useSession } from 'next-auth/react'
import { setCheckoutItems, setExistingUser } from 'src/store/slices/checkoutSlice'
import { fontFamilyHeading } from 'src/theme/typography'

const MotionBox = motion(Box)

/* ═══════════════════════════════════════════════════════════════════════════
 *  Helpers
 * ═════════════════════════════════════════════════════════════════════════ */

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

function getEventImage(event) {
  if (event?.images && Array.isArray(event.images) && event.images.length > 0) {
    const img = event.images[0]
    return typeof img === 'string' ? img : img?.url || null
  }
  return null
}

function getAllEventImages(event) {
  if (!event?.images || !Array.isArray(event.images) || event.images.length === 0) return []
  return event.images.map(img =>
    typeof img === 'string' ? { url: img, alt: event.title } : { url: img?.url, alt: img?.alt || event.title }
  ).filter(img => img.url)
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Countdown hook — always counts down to the festival start date
 * ═════════════════════════════════════════════════════════════════════════ */
const FEST_START = new Date('2026-04-07T09:00:00').getTime()

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = FEST_START - Date.now()
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 }
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000)
    }
  })

  useEffect(() => {
    const tick = () => {
      const diff = FEST_START - Date.now()
      if (diff <= 0) {
        setTimeLeft(prev => prev.s === 0 && prev.d === 0 ? prev : { d: 0, h: 0, m: 0, s: 0 })
        return
      }
      const next = {
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000)
      }
      setTimeLeft(prev =>
        prev.d === next.d && prev.h === next.h &&
        prev.m === next.m && prev.s === next.s
          ? prev
          : next
      )
    }
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return timeLeft
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Loading Skeleton — matches the new layout
 * ═════════════════════════════════════════════════════════════════════════ */
function DetailSkeleton() {
  return (
    <Box>
      {/* Hero skeleton */}
      <Box sx={{
        display: 'flex', flexDirection: { xs: 'column', md: 'row' },
        maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, pt: { xs: 2, md: 4 }, pb: 3, gap: 3
      }}>
        <Box sx={{ width: { xs: '100%', md: '50%' } }}>
          <Skeleton variant='rectangular' sx={{ borderRadius: '16px', height: { xs: 300, md: 420 } }} />
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} variant='rectangular' sx={{ width: 64, height: 64, borderRadius: '8px' }} />
            ))}
          </Box>
        </Box>
        <Box sx={{ flex: 1, pt: { md: 1 } }}>
          <Skeleton width='30%' height={16} sx={{ mb: 2 }} />
          <Skeleton width='80%' height={44} sx={{ mb: 1 }} />
          <Skeleton width='50%' height={20} sx={{ mb: 3 }} />
          <Skeleton variant='rectangular' height={160} sx={{ borderRadius: '14px', mb: 2 }} />
          <Skeleton width='60%' height={10} />
        </Box>
      </Box>
      {/* Tabs skeleton */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', gap: 3, py: 1.5 }}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} width={80} height={24} sx={{ borderRadius: '4px' }} />
          ))}
        </Box>
      </Box>
      {/* Content skeleton */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant='rectangular' height={80} sx={{ borderRadius: '14px', mb: 2 }} />
        ))}
      </Box>
    </Box>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Countdown Cell
 * ═════════════════════════════════════════════════════════════════════════ */
function CountCell({ value, label, textColor }) {
  return (
    <Box sx={{ textAlign: 'center', minWidth: 40 }}>
      <Typography
        sx={{
          fontFamily: fontFamilyHeading,
          fontWeight: 800,
          fontSize: { xs: '1.35rem', md: '1.6rem' },
          lineHeight: 1,
          color: textColor || 'text.primary'
        }}
      >
        {String(value).padStart(2, '0')}
      </Typography>
      <Typography
        sx={{
          fontSize: '0.58rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: textColor ? alpha(textColor, 0.65) : 'text.disabled',
          mt: 0.25
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Event Detail View
 * ═════════════════════════════════════════════════════════════════════════ */
export default function EventDetailView() {
  const c = useAppPalette()
  const router = useRouter()
  const dispatch = useDispatch()
  const { data: session } = useSession()
  const { id } = router.query
  const { currentEvent: event, currentEventLoading: loading, currentEventError } = useSelector(state => state.events)
  const timeLeft = useCountdown()
  const isMobile = useMediaQuery(c.theme.breakpoints.down('md'))
  const [activeTab, setActiveTab] = useState(0)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    if (id) dispatch(fetchEventById(id))
    return () => { dispatch(clearCurrentEvent()) }
  }, [dispatch, id])

  if (loading || !event) {
    if (currentEventError) {
      return (
        <Container maxWidth='xl' sx={{ py: { xs: 10, md: 16 }, textAlign: 'center' }}>
          <Icon icon='tabler:alert-circle' fontSize={56} style={{ color: c.error }} />
          <Typography variant='h5' sx={{ mt: 3, fontWeight: 700 }}>Event Not Found</Typography>
          <Typography variant='body1' sx={{ color: 'text.secondary', mt: 1, mb: 4 }}>
            The event you are looking for does not exist or has been removed.
          </Typography>
          <Button
            variant='outlined'
            onClick={() => router.push('/events')}
            startIcon={<Icon icon='tabler:arrow-left' />}
            sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none' }}
          >
            Back to Events
          </Button>
        </Container>
      )
    }
    return <DetailSkeleton />
  }

  const color = c.primary
  const fillPct = event.seats > 0 ? Math.round(((event.registered || 0) / event.seats) * 100) : 0
  const almostFull = fillPct >= 80
  const spotsLeft = event.seats - (event.registered || 0)
  const allImages = getAllEventImages(event)
  const currentImage = allImages[activeImageIndex] || null
  const hasGallery = allImages.length > 1
  const isOver = event.start_time ? new Date(event.start_time).getTime() <= Date.now() : false
  const details = event.details || {}

  const hasPrizes = details.prize && typeof details.prize === 'object' && Object.keys(details.prize).length > 0
  const hasRules = details.rules && details.rules.length > 0
  const hasRounds = details.rounds > 0

  // Build meta info rows
  const metaRows = []
  const displayDate = event.date || (event.start_time ? formatDate(event.start_time) : null)
  if (displayDate) metaRows.push({ label: 'Date', value: displayDate })
  if (event.start_time || event.end_time) {
    metaRows.push({
      label: 'Time',
      value: event.end_time
        ? `${formatTime(event.start_time)} — ${formatTime(event.end_time)}`
        : formatTime(event.start_time)
    })
  }
  if (event.venue) metaRows.push({ label: 'Venue', value: event.venue })
  if (details.team_size_text) metaRows.push({ label: 'Team Size', value: details.team_size_text })
  if (event.ticket_price > 0) metaRows.push({ label: 'Entry Fee', value: `₹${parseFloat(event.ticket_price).toLocaleString('en-IN')}` })

  return (
    <Box
      component='main'
      aria-label={`Event: ${event.title}`}
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', pb: { xs: 'calc(80px + env(safe-area-inset-bottom, 0px))', md: '80px' } }}
    >

      {/* ═══════════════════════════════════════════════════════════════════
       *  ZONE 1: Two-Column Hero
       * ═════════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'flex-start',
          maxWidth: 1200,
          mx: 'auto',
          width: '100%',
          px: { xs: 2, md: 4 },
          pt: { xs: 2, md: 4 },
          pb: { xs: 2, md: 4 }
        }}
      >
        {/* ───── LEFT: Image Gallery ───── */}
        <Box
          sx={{
            width: { xs: '100%', md: '50%' },
            pr: { md: 3 },
            position: { md: 'sticky' },
            top: { md: 90 },
            alignSelf: 'flex-start'
          }}
        >
          {/* Main Image */}
          <Box sx={{ position: 'relative', width: '100%' }}>
            {currentImage ? (
              <Box
                component='img'
                src={currentImage.url}
                alt={currentImage.alt || event.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: { xs: '50vh', md: '65vh' },
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: '16px'
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 300,
                  borderRadius: '16px',
                  bgcolor: alpha(color, 0.04),
                  border: `1px solid ${c.dividerA30}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon icon='tabler:calendar-event' fontSize={72} style={{ color: alpha(color, 0.25) }} />
              </Box>
            )}

            {/* Featured badge */}
            {event.featured && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  px: 2,
                  py: 0.5,
                  borderRadius: '100px',
                  background: alpha(color, 0.18),
                  border: '1px solid',
                  borderColor: alpha(color, 0.35),
                  backdropFilter: 'blur(8px)'
                }}
              >
                <Typography
                  variant='caption'
                  sx={{ color, fontWeight: 800, fontSize: '0.68rem', letterSpacing: '0.12em' }}
                >
                  ★ FEATURED
                </Typography>
              </Box>
            )}
          </Box>

          {/* Thumbnail strip */}
          {hasGallery && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, overflowX: 'auto', pb: 0.5 }}>
              {allImages.map((img, i) => (
                <Box
                  key={i}
                  component='img'
                  src={img.url}
                  alt={img.alt || `Image ${i + 1}`}
                  loading='lazy'
                  onClick={() => setActiveImageIndex(i)}
                  sx={{
                    width: { xs: 48, md: 64 },
                    height: { xs: 48, md: 64 },
                    borderRadius: '8px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    flexShrink: 0,
                    border: '2px solid',
                    borderColor: i === activeImageIndex ? color : 'transparent',
                    opacity: i === activeImageIndex ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                    '&:hover': { opacity: 1, borderColor: alpha(color, 0.4) }
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* ───── RIGHT: Sticky Info Panel ───── */}
        <Box
          sx={{
            flex: 1,
            pl: { md: 3 },
            pt: { xs: 2, md: 0 },
            minWidth: 0
          }}
        >
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back link */}
            <Button
              onClick={() => router.push('/events')}
              startIcon={<Icon icon='tabler:arrow-left' fontSize={15} />}
              sx={{
                justifyContent: 'flex-start',
                color: 'text.secondary',
                width: 'fit-content',
                mb: 1.5,
                p: 0,
                minWidth: 0,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                '&:hover': { color: color }
              }}
            >
              All Events
            </Button>

            {/* Title */}
            <Typography
              variant='h3'
              component='h1'
              sx={{
                fontFamily: fontFamilyHeading,
                fontWeight: 800,
                letterSpacing: '-0.5px',
                fontSize: { xs: '2rem', md: '2.6rem' },
                lineHeight: 1.1,
                mb: 1,
                color: 'text.primary'
              }}
            >
              {event.title}
            </Typography>

            {/* Tagline */}
            {event.tagline && (
              <Typography
                variant='body1'
                sx={{
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: 'text.secondary',
                  mb: 3,
                  lineHeight: 1.6,
                  fontSize: '1rem'
                }}
              >
                {event.tagline}
              </Typography>
            )}

            {/* Meta Info Card */}
            {metaRows.length > 0 && (
              <Box
                sx={{
                  borderRadius: '14px',
                  border: '1px solid',
                  borderColor: c.dividerA30,
                  background: 'transparent',
                  mb: 2,
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }
                }}
              >
                {metaRows.map((row) => (
                  <Box key={row.label} sx={{ px: 3, py: 2.25 }}>
                    <Typography
                      variant='caption'
                      sx={{
                        color: 'text.disabled',
                        fontWeight: 700,
                        fontSize: '0.66rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        display: 'block',
                        mb: 0.5
                      }}
                    >
                      {row.label}
                    </Typography>
                    <Typography
                      variant='h6'
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '1rem', md: '1.1rem' },
                        color: 'text.primary',
                        lineHeight: 1.3
                      }}
                    >
                      {row.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

          

            {/* ── Mobile inline action buttons ── */}
            {isMobile && (
              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {event.registration_link ? (
                  <Button
                    variant='contained'
                    disableElevation
                    fullWidth
                    href={event.registration_link}
                    target='_blank'
                    rel='noopener noreferrer'
                    startIcon={<Icon icon='tabler:external-link' fontSize={18} />}
                    sx={{
                      bgcolor: color,
                      color: c.white,
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      py: 1.5,
                      '&:hover': { bgcolor: alpha(color, 0.88) }
                    }}
                  >
                    Register Now
                  </Button>
                ) : (
                  <Button
                    variant='contained'
                    disableElevation
                    fullWidth
                    disabled={spotsLeft <= 0}
                    onClick={() => {
                      dispatch(setCheckoutItems({
                        items: [{ eventId: event.id, quantity: 1 }],
                        source: 'buyNow'
                      }))
                      if (session?.user?.id) {
                        dispatch(setExistingUser({ userId: session.user.id }))
                        router.push('/checkout')
                      } else {
                        router.push('/login?returnUrl=/checkout')
                      }
                    }}
                    sx={{
                      bgcolor: color,
                      color: c.white,
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      py: 1.5,
                      '&:hover': { bgcolor: alpha(color, 0.88) },
                      '&.Mui-disabled': { bgcolor: c.dividerA30, color: c.textDisabled }
                    }}
                  >
                    {spotsLeft <= 0 ? 'Sold Out' : 'Buy Now'}
                  </Button>
                )}
                {!event.registration_link && (
                  <Button
                    variant='outlined'
                    fullWidth
                    disabled={spotsLeft <= 0}
                    onClick={() => dispatch(addToCart({
                      eventId: event.id,
                      title: event.title,
                      ticketPrice: event.ticket_price || 0,
                      quantity: 1,
                      image: getEventImage(event),
                      startTime: event.start_time,
                      venue: event.venue,
                      maxAvailable: spotsLeft > 0 ? spotsLeft : 0
                    }))}
                    startIcon={<Icon icon='tabler:shopping-cart-plus' fontSize={18} />}
                    sx={{
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textTransform: 'none',
                      py: 1.35,
                      borderColor: alpha(color, 0.4),
                      color,
                      '&:hover': { borderColor: color, bgcolor: alpha(color, 0.06) },
                      '&.Mui-disabled': { borderColor: c.dividerA30, color: c.textDisabled }
                    }}
                  >
                    Add to Cart
                  </Button>
                )}
                <Button
                  variant='outlined'
                  fullWidth
                  onClick={() => router.push('/events')}
                  startIcon={<Icon icon='tabler:arrow-left' fontSize={15} />}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    py: 1.35,
                    borderColor: c.dividerA30,
                    color: c.textSecondary,
                    '&:hover': { borderColor: color, color, bgcolor: alpha(color, 0.04) }
                  }}
                >
                  See All Events
                </Button>
              </Box>
            )}
          </MotionBox>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════════
       *  ZONE 2: Sticky Tabs Bar
       * ═════════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          borderBottom: `1px solid ${c.dividerA30}`,
          borderTop: `1px solid ${c.dividerA30}`,
          bgcolor: c.bgPaper,
          position: 'sticky',
          top: { xs: 56, md: 64 },
          zIndex: 10
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 0.5, md: 4 } }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant='scrollable'
            scrollButtons='auto'
            allowScrollButtonsMobile
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                fontFamily: fontFamilyHeading,
                minWidth: 'auto',
                px: { xs: 2, md: 3 },
                py: 1.5,
                gap: 0.75,
                color: 'text.secondary',
                '&.Mui-selected': { color: color, fontWeight: 700 },
                '&.Mui-disabled': { opacity: 0.4 }
              },
              '& .MuiTabs-indicator': { display: 'none' }
            }}
            TabIndicatorProps={{
              sx: { bgcolor: color, height: 3, borderRadius: '3px 3px 0 0' }
            }}
          >
            <Tab label='Overview' icon={<Icon icon='tabler:info-circle' fontSize={18} />} iconPosition='start' />
            <Tab label='Prizes' icon={<Icon icon='tabler:trophy' fontSize={18} />} iconPosition='start' disabled={!hasPrizes} />
            <Tab label='Rules' icon={<Icon icon='tabler:list-check' fontSize={18} />} iconPosition='start' disabled={!hasRules} />
            <Tab label='Rounds' icon={<Icon icon='tabler:topology-ring-3' fontSize={18} />} iconPosition='start' disabled={!hasRounds} />
          </Tabs>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════════
       *  ZONE 3: Tab Content Area
       * ═════════════════════════════════════════════════════════════════ */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 }, minHeight: '40vh' }}>

        {/* ── Tab 0: Overview ── */}
        {activeTab === 0 && (
          <MotionBox initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Description */}
            {event.description && (
              <Box sx={{ mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon icon='tabler:info-circle' fontSize={20} style={{ color }} />
                  </Box>
                  <Typography variant='h6' sx={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em', color: 'text.primary' }}>
                    About This Event
                  </Typography>
                </Box>
                <Typography
                  variant='body1'
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.85,
                    fontSize: '0.95rem',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {event.description}
                </Typography>
              </Box>
            )}

            {/* Brief */}
            {details.brief && (
              <Box
                sx={{
                  mb: 5,
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: '16px',
                  border: `1px solid ${alpha(color, 0.12)}`,
                  background: alpha(color, 0.03),
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: color, borderRadius: '4px 0 0 4px' }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon icon='tabler:file-description' fontSize={20} style={{ color }} />
                  </Box>
                  <Typography variant='h6' sx={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em', color: 'text.primary' }}>
                    Brief
                  </Typography>
                </Box>
                <Typography
                  variant='body1'
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.85,
                    fontSize: '0.95rem',
                    whiteSpace: 'pre-line',
                    pl: 1
                  }}
                >
                  {details.brief}
                </Typography>
              </Box>
            )}

            {/* Download Document */}
            {details.document_url && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='overline'
                  sx={{ color, fontWeight: 700, letterSpacing: '0.12em', mb: 1.5, display: 'block' }}
                >
                  Event Document
                </Typography>
                <Button
                  component='a'
                  href={details.document_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  download
                  variant='outlined'
                  startIcon={<Icon icon='tabler:file-download' fontSize={18} />}
                  sx={{
                    borderRadius: '10px',
                    borderColor: alpha(color, 0.5),
                    color,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    px: 2.5,
                    py: 1,
                    '&:hover': {
                      borderColor: color,
                      bgcolor: alpha(color, 0.06)
                    }
                  }}
                >
                  Download Event Details
                </Button>
              </Box>
            )}

            {/* Fallback if no overview content at all */}
            {!event.description && !details.brief && !details.document_url && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Icon icon='tabler:info-circle' fontSize={48} style={{ color: alpha(color, 0.2) }} />
                <Typography sx={{ color: 'text.disabled', mt: 2 }}>No overview information available.</Typography>
              </Box>
            )}
          </MotionBox>
        )}

        {/* ── Tab 1: Prizes ── */}
        {activeTab === 1 && (
          <MotionBox initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {hasPrizes ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon icon='tabler:trophy' fontSize={20} style={{ color }} />
                  </Box>
                  <Typography variant='h6' sx={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em', color: 'text.primary' }}>
                    Prizes
                  </Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                  {details.prize.total && (
                    <Box
                      sx={{
                        gridColumn: { sm: '1 / -1' },
                        p: 3,
                        borderRadius: '14px',
                        background: `linear-gradient(135deg, ${alpha(color, 0.12)} 0%, ${alpha(color, 0.04)} 100%)`,
                        border: `1px solid ${alpha(color, 0.15)}`,
                        textAlign: 'center'
                      }}
                    >
                      <Typography sx={{ color: 'text.disabled', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.5 }}>
                        Total Prize Pool
                      </Typography>
                      <Typography sx={{ color, fontWeight: 900, fontSize: '1.8rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        ₹{details.prize.total.toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                  )}
                  {['1st', '2nd', '3rd'].map((place, idx) => (
                    details.prize[place] ? (
                      <Box
                        key={place}
                        sx={{
                          p: 2.5,
                          borderRadius: '12px',
                          border: `1px solid ${c.dividerA30}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          transition: 'all 0.2s ease',
                          '&:hover': { borderColor: alpha(color, 0.3), bgcolor: alpha(color, 0.03) }
                        }}
                      >
                        <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: alpha(color, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color }}>{idx + 1}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {place} Prize
                          </Typography>
                          <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: 'text.primary', lineHeight: 1.3 }}>
                            ₹{details.prize[place].toLocaleString('en-IN')}
                          </Typography>
                        </Box>
                      </Box>
                    ) : null
                  ))}
                  {details.prize.mvp && (
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: '12px',
                        border: `1px solid ${c.dividerA30}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': { borderColor: alpha(color, 0.3), bgcolor: alpha(color, 0.03) }
                      }}
                    >
                      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: alpha(color, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon icon='tabler:star' fontSize={20} style={{ color }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          MVP Prize
                        </Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: 'text.primary', lineHeight: 1.3 }}>
                          ₹{details.prize.mvp.toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: 'text.disabled' }}>No prize information available.</Typography>
              </Box>
            )}
          </MotionBox>
        )}

        {/* ── Tab 2: Rules ── */}
        {activeTab === 2 && (
          <MotionBox initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {hasRules ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon icon='tabler:list-check' fontSize={20} style={{ color }} />
                  </Box>
                  <Typography variant='h6' sx={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em', color: 'text.primary' }}>
                    Rules
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {details.rules.map((rule, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        p: 2,
                        borderRadius: '12px',
                        border: `1px solid ${c.dividerA30}`,
                        transition: 'all 0.2s ease',
                        '&:hover': { borderColor: alpha(color, 0.25), bgcolor: alpha(color, 0.02) }
                      }}
                    >
                      <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: alpha(color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.25 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', color }}>{i + 1}</Typography>
                      </Box>
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.92rem', lineHeight: 1.7, flex: 1 }}>
                        {rule}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: 'text.disabled' }}>No rules information available.</Typography>
              </Box>
            )}
          </MotionBox>
        )}

        {/* ── Tab 3: Rounds ── */}
        {activeTab === 3 && (
          <MotionBox initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {hasRounds ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon icon='tabler:topology-ring-3' fontSize={20} style={{ color }} />
                  </Box>
                  <Typography variant='h6' sx={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.01em', color: 'text.primary' }}>
                    Rounds
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 3,
                    py: 2,
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.03)} 100%)`,
                    border: `1px solid ${alpha(color, 0.15)}`
                  }}
                >
                  <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: alpha(color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color }}>{details.rounds}</Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary' }}>
                    {details.rounds === 1 ? 'Round' : 'Rounds'}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: 'text.disabled' }}>No rounds information available.</Typography>
              </Box>
            )}
          </MotionBox>
        )}
      </Box>

      {/* ═══════════════════════════════════════════════════════════════════
       *  ZONE 4: Bottom Sticky CTA Bar — Desktop only (UNCHANGED)
       * ═════════════════════════════════════════════════════════════════ */}
      {!isMobile && (
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          bgcolor: color,
          backdropFilter: 'blur(20px)',
          px: { xs: 2, md: 5 },
          py: { xs: 2, md: 2.5 }
        }}
      >
        <Box
          sx={{
            maxWidth: 'lg',
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1.5, md: 3 },
            flexWrap: { xs: 'wrap', sm: 'nowrap' }
          }}
        >
          {/* Countdown */}
          {!isOver ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 } }}>
              <CountCell value={timeLeft.d} label='Days' textColor={c.bgPaper} />
              <Typography sx={{ fontWeight: 800, color: c.bgPaper, fontSize: '1.1rem', pb: '18px' }}>:</Typography>
              <CountCell value={timeLeft.h} label='Hrs' textColor={c.bgPaper} />
              <Typography sx={{ fontWeight: 800, color: c.bgPaper, fontSize: '1.1rem', pb: '18px' }}>:</Typography>
              <CountCell value={timeLeft.m} label='Min' textColor={c.bgPaper} />
              <Typography sx={{ fontWeight: 800, color: c.bgPaper, fontSize: '1.1rem', pb: '18px' }}>:</Typography>
              <CountCell value={timeLeft.s} label='Sec' textColor={c.bgPaper} />
            </Box>
          ) : (
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: c.bgPaper }}>
              Event Concluded
            </Typography>
          )}

          <Box sx={{ flex: 1 }} />

          {/* See All Events */}
          <Button
            variant='outlined'
            onClick={() => router.push('/events')}
            startIcon={<Icon icon='tabler:arrow-left' fontSize={15} />}
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'none',
              borderColor: c.bgPaper,
              color: c.bgPaper,
              px: 2.5,
              height: 44,
              '&:hover': {
                borderColor: c.bgPaper,
                color: c.bgPaper,
                bgcolor: alpha(c.bgPaper, 0.12)
              }
            }}
          >
            See All Events
          </Button>

          {/* Registration Link or Normal Purchase Buttons */}
          {event.registration_link ? (
            // Registration Link Button (Desktop)
            <Button
              variant='outlined'
              disableElevation
              href={event.registration_link}
              target='_blank'
              rel='noopener noreferrer'
              startIcon={<Icon icon='tabler:external-link' fontSize={18} />}
              sx={{
                borderRadius: '10px',
                fontFamily: fontFamilyHeading,
                fontWeight: 800,
                fontSize: '0.9rem',
                textTransform: 'none',
                px: { xs: 3, md: 5 },
                height: 44,
                borderColor: c.bgPaper,
                color: c.bgPaper,
                bgcolor: 'transparent',
                '&:hover': {
                  bgcolor: alpha(c.bgPaper, 0.12),
                  borderColor: c.bgPaper
                },
                transition: 'all 0.2s ease'
              }}
            >
              Register Now
            </Button>
          ) : (
            <>
              {/* Add to Cart */}
              <Button
                variant='outlined'
                disableElevation
                disabled={spotsLeft <= 0}
                onClick={() => dispatch(addToCart({
                  eventId: event.id,
                  title: event.title,
                  ticketPrice: event.ticket_price || 0,
                  quantity: 1,
                  image: getEventImage(event),
                  startTime: event.start_time,
                  venue: event.venue,
                  maxAvailable: spotsLeft > 0 ? spotsLeft : 0
                }))}
                startIcon={<Icon icon='tabler:shopping-cart-plus' fontSize={18} />}
                sx={{
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  px: 2.5,
                  height: 44,
                  borderColor: c.bgPaper,
                  color: c.bgPaper,
                  '&:hover': {
                    borderColor: c.bgPaper,
                    color: c.bgPaper,
                    bgcolor: alpha(c.bgPaper, 0.12)
                  },
                  '&.Mui-disabled': {
                    borderColor: c.dividerA30,
                    color: c.textDisabled
                  }
                }}
              >
                Add to Cart
              </Button>

              {/* Buy Now */}
              <Button
                variant='outlined'
                disableElevation
                disabled={spotsLeft <= 0}
                onClick={() => {
                  dispatch(setCheckoutItems({
                    items: [{ eventId: event.id, quantity: 1 }],
                    source: 'buyNow'
                  }))
                  if (session?.user?.id) {
                    dispatch(setExistingUser({ userId: session.user.id }))
                    router.push('/checkout')
                  } else {
                    router.push('/login?returnUrl=/checkout')
                  }
                }}
                sx={{
                  borderRadius: '10px',
                  fontFamily: fontFamilyHeading,
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  px: { xs: 3, md: 5 },
                  height: 44,
                  borderColor: spotsLeft <= 0 ? c.dividerA30 : c.bgPaper,
                  color: spotsLeft <= 0 ? c.textDisabled : color,
                  bgcolor: spotsLeft <= 0 ? 'transparent' : c.bgPaper,
                  '&:hover': {
                    bgcolor: alpha(c.bgPaper, 0.88),
                    borderColor: c.bgPaper
                  },
                  '&.Mui-disabled': {
                    borderColor: c.dividerA30,
                    color: c.textDisabled,
                    bgcolor: 'transparent'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {spotsLeft <= 0 ? 'Sold Out' : 'Buy Now'}
              </Button>
            </>
          )}
        </Box>
      </Box>
      )}
    </Box>
  )
}
