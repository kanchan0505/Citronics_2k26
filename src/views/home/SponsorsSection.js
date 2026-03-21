import { memo, useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppPalette } from 'src/components/palette'

const MotionBox = motion(Box)

/* ── Sponsor Categories with actual logos ───────────────────────────────── */
const SPONSOR_CATEGORIES = [
  {
    category: 'Banking Partner',
    logos: [
      { name: 'HDFC Bank', src: '/sponsors/hdfc.png' }
    ]
  },
  {
    category: 'Community Partners',
    logos: [
      { name: 'Shekunj', src: '/sponsors/shekunj.png' },
      { name: 'Mayor', src: '/sponsors/mayor.png' }
    ]
  },
  {
    category: 'Media Partner',
    logos: [
      { name: 'Indore Talk', src: '/sponsors/indoretalkWhite.png' }
    ]
  }
]

/* ── Single animated logo column ───────────────────────────────────────── */
const SponsorLogo = memo(function SponsorLogo({ logo, c, isDark }) {
  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 150, md: 200 },
        width: { xs: 150, md: 200 },
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box
        component='img'
        src={logo.src}
        alt={logo.name}
        sx={{
          width: { xs: 130, md: 180 },
          height: 'auto',
          objectFit: 'contain',
          filter: isDark ? 'drop-shadow(0 0 8px rgba(255,255,255,0.10))' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))',
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'scale(1.1)' }
        }}
      />
    </Box>
  )
})

/* ═══════════════════════════════════════════════════════════════════════════
 *  SponsorsSection — Citronics 2026
 * ═════════════════════════════════════════════════════════════════════════ */

export default function SponsorsSection() {
  const c = useAppPalette()
  const isDark = c.isDark

  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0)

  // Cycle through categories: Community Partners stays for 2.4s (shows both), others for 2.4s each
  useEffect(() => {
    const currentCategory = SPONSOR_CATEGORIES[currentCategoryIndex]
    // Community Partners (index 1) shows both logos at once, so only 1 "iteration"
    const itemCount = currentCategory.category === 'Community Partners' ? 1 : currentCategory.logos.length
    const totalTime = itemCount * 2400

    const categoryTimer = setInterval(() => {
      setCurrentCategoryIndex(prev => (prev + 1) % SPONSOR_CATEGORIES.length)
      setCurrentLogoIndex(0)
    }, totalTime)

    return () => clearInterval(categoryTimer)
  }, [currentCategoryIndex])

  // Cycle through logos within current category (skip for Community Partners)
  useEffect(() => {
    const currentCategory = SPONSOR_CATEGORIES[currentCategoryIndex]
    // Don't cycle through Community Partners - show both at once
    if (currentCategory.category === 'Community Partners' || currentCategory.logos.length <= 1) return

    const logoTimer = setInterval(() => {
      setCurrentLogoIndex(prev => (prev + 1) % currentCategory.logos.length)
    }, 2400)

    return () => clearInterval(logoTimer)
  }, [currentCategoryIndex])

  const currentCategory = SPONSOR_CATEGORIES[currentCategoryIndex]
  const validLogoIndex = Math.min(currentLogoIndex, currentCategory.logos.length - 1)
  const currentLogo = currentCategory.logos[validLogoIndex]

  // Guard against undefined logo
  if (!currentLogo) {
    return null
  }

  return (
    <Box
      component='section'
      sx={{
        py: { xs: 8, md: 14 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth='lg'>
        {/* ── Header ─────────────────────────────────────────────── */}
        <MotionBox
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}
        >
          <Typography
            variant='overline'
            sx={{
              color: c.primary,
              letterSpacing: 4,
              fontWeight: 700,
              mb: 1.5,
              display: 'block'
            }}
          >
            OUR SPONSORS & PARTNERS
          </Typography>
          <Typography
            variant='h3'
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: c.textPrimary,
              mb: 1.5,
              fontSize: { xs: '1.75rem', md: '2.5rem' }
            }}
          >
            Powering Citronics 2026
          </Typography>
        </MotionBox>

        {/* ── Dynamic Category Display ─────────────────────────── */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            mb: { xs: 6, md: 8 }
          }}
        >
          {/* Dynamic Category Heading */}
          <AnimatePresence mode='wait'>
            <MotionBox
              key={currentCategoryIndex}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              sx={{ textAlign: 'center' }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.3rem', md: '1.6rem' },
                  color: c.primary,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase'
                }}
              >
                {currentCategory.category}
              </Typography>
              <Box
                sx={{
                  width: 50,
                  height: 3,
                  background: c.gradientPrimary,
                  borderRadius: '2px',
                  mx: 'auto',
                  mt: 1.5
                }}
              />
            </MotionBox>
          </AnimatePresence>

          {/* Animated Logo Display */}
          <AnimatePresence mode='wait'>
            {currentCategory.category === 'Community Partners' ? (
              // Show both Community Partner logos side by side
              <MotionBox
                key={`${currentCategoryIndex}-both`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 25,
                  duration: 0.6
                }}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: { xs: 2, md: 4 },
                  flexWrap: 'wrap'
                }}
              >
                {currentCategory.logos.map((logo) => (
                  <Box key={logo.name}>
                    <SponsorLogo
                      logo={logo}
                      c={c}
                      isDark={isDark}
                    />
                  </Box>
                ))}
              </MotionBox>
            ) : (
              // Show single logo for other categories
              <MotionBox
                key={`${currentCategoryIndex}-${currentLogoIndex}`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 25,
                  duration: 0.6
                }}
                sx={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <SponsorLogo
                  logo={currentLogo}
                  c={c}
                  isDark={isDark}
                />
              </MotionBox>
            )}
          </AnimatePresence>

         
        </Box>

        
      </Container>
    </Box>
  )
}