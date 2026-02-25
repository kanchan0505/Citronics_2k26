import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import NeuralBackground from 'src/components/NeuralBackground'
import PublicNavbar from 'src/views/home/PublicNavbar'
import HeroSection from 'src/views/home/HeroSection'
import AboutSection from 'src/views/home/AboutSection'
import StatsSection from 'src/views/home/StatsSection'
import EventsSection from 'src/views/home/EventsSection'
import ScheduleSection from 'src/views/home/ScheduleSection'
import TestimonialsSection from 'src/views/home/TestimonialsSection'
import SponsorsSection from 'src/views/home/SponsorsSection'
import CTABanner from 'src/views/home/CTABanner'
import PublicFooter from 'src/views/home/PublicFooter'
import { fetchHomeData } from 'src/store/slices/eventsSlice'

/**
 * Public Home Page — Citronics 2026
 * Visible to all visitors. No authentication required.
 * All data fetched from DB via /api/home on mount.
 */
const Home = () => {
  const dispatch = useDispatch()
  const { homeData, homeLoading } = useSelector(state => state.events)

  useEffect(() => {
    dispatch(fetchHomeData())
  }, [dispatch])

  // Show a brief loader while data is fetching on first load
  if (homeLoading && !homeData) {
    return (
      <NeuralBackground>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress color='primary' />
        </Box>
      </NeuralBackground>
    )
  }

  const {
    categories = [],
    events = [],
    scheduleDays = [],
    stats = [],
    sponsors = [],
    testimonials = [],
    heroWords = [],
    highlights = [],
    eventStartDate = null
  } = homeData || {}

  return (
    <NeuralBackground>
      <Box sx={{ overflowX: 'hidden' }}>
        <PublicNavbar />
        <HeroSection heroWords={heroWords} eventStartDate={eventStartDate} />
        <AboutSection highlights={highlights} />
        <StatsSection stats={stats} />
        <EventsSection events={events} categories={categories} />
        <ScheduleSection scheduleDays={scheduleDays} />
        <TestimonialsSection testimonials={testimonials} />
        <SponsorsSection sponsors={sponsors} />
        <CTABanner />
        <PublicFooter />
      </Box>
    </NeuralBackground>
  )
}

// ── Page-level config ─────────────────────────────────────────────────────────
// Public page — no auth guard, no guest guard, no layout wrapper
Home.authGuard = false
Home.guestGuard = false
Home.getLayout = page => page

export default Home
