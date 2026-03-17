import { useState, useEffect, useRef, useCallback, memo } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'
import { alpha } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'

const MotionBox = motion(Box)

const BATCH_SIZE = 8

/* ── Lightbox ───────────────────────────────────────────────── */

function Lightbox({ image, onClose }) {
  const c = useAppPalette()

  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <MotionBox
      role='dialog'
      aria-modal='true'
      aria-label={`${image.title} — ${image.category}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: alpha(c.black, 0.85),
        backdropFilter: 'blur(20px)',
        cursor: 'zoom-out',
        p: 3
      }}
    >
      <MotionBox
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh' }}
      >
        <Box
          component='img'
          src={image.url}
          alt={image.title}
          sx={{
            maxWidth: '100%',
            maxHeight: '85vh',
            borderRadius: '16px',
            objectFit: 'contain',
            boxShadow: `0 32px 80px ${alpha(c.black, 0.5)}`
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -48,
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center'
          }}
        >
          <Typography sx={{ color: c.white, fontWeight: 600 }}>{image.title}</Typography>
          <Typography variant='caption' sx={{ color: alpha(c.white, 0.6) }}>{image.category}</Typography>
        </Box>

        {/* Close button */}
        <IconButton
          onClick={onClose}
          aria-label='Close lightbox'
          size='small'
          sx={{
            position: 'absolute',
            top: -14,
            right: -14,
            width: 36,
            height: 36,
            bgcolor: alpha(c.white, 0.15),
            color: c.white,
            transition: 'all 0.2s ease',
            '&:hover': { bgcolor: alpha(c.white, 0.25) }
          }}
        >
          <Icon icon='tabler:x' fontSize={18} />
        </IconButton>
      </MotionBox>
    </MotionBox>
  )
}

/* ── Gallery Card ───────────────────────────────────────────── */

const GalleryCard = memo(function GalleryCard({ image, index, onClick }) {
  const c = useAppPalette()

  return (
    <MotionBox
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.4, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
      tabIndex={0}
      role='button'
      aria-label={`View ${image.title}`}
      onClick={() => onClick(image)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(image) } }}
      sx={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'zoom-in',
        breakInside: 'avoid',
        mb: 2,
        '&:hover .gallery-overlay, &:focus-visible .gallery-overlay': { opacity: 1 },
        '&:hover img, &:focus-visible img': { transform: 'scale(1.05)' },
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 }
      }}
    >
      <Box
        component='img'
        src={image.url}
        alt={image.title}
        loading='lazy'
        sx={{
          width: '100%',
          display: 'block',
          borderRadius: '16px',
          transition: 'transform 0.5s ease'
        }}
      />

      {/* Hover overlay */}
      <Box
        className='gallery-overlay'
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '16px',
          background: `linear-gradient(180deg, transparent 40%, ${alpha(c.black, 0.7)} 100%)`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 2.5
        }}
      >
        <Typography sx={{ color: c.white, fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>
          {image.title}
        </Typography>
      </Box>
    </MotionBox>
  )
})

/* ── Gallery Section Component (Backup for future use) ────────────────────────────── */

function GallerySection({ title, description, images, isLoading, onClick }) {
  const c = useAppPalette()
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const [sectionLoading, setSectionLoading] = useState(false)
  const sentinelRef = useRef(null)

  const visibleImages = images.slice(0, visibleCount)
  const hasMore = visibleCount < images.length

  const loadMore = useCallback(() => {
    if (!hasMore || sectionLoading) return
    setSectionLoading(true)
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + BATCH_SIZE, images.length))
      setSectionLoading(false)
    }, 600)
  }, [hasMore, sectionLoading, images.length])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [loadMore])

  return (
    <Box sx={{ mb: { xs: 8, md: 12 } }}>
      {/* Section Header */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ mb: 6 }}
      >
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 4,
              height: 32,
              borderRadius: '2px',
              background: `linear-gradient(180deg, ${c.primary} 0%, ${alpha(c.primary, 0.4)} 100%)`
            }}
          />
          <Typography
            variant='h4'
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              color: c.textPrimary,
              letterSpacing: '-0.5px'
            }}
          >
            {title}
          </Typography>
        </Box>
        {description && (
          <Typography
            sx={{
              color: c.textSecondary,
              fontSize: '1rem',
              lineHeight: 1.6,
              maxWidth: 600,
              ml: 6
            }}
          >
            {description}
          </Typography>
        )}
      </MotionBox>

      {/* Gallery Grid */}
      {isLoading ? (
        <Box sx={{ columnCount: { xs: 1, sm: 2, md: 3 }, columnGap: 2 }}>
          {[...Array(6)].map((_, i) => {
            const heights = [200, 250, 220, 280, 240, 260]
            return (
              <Box key={i} sx={{ mb: 2, breakInside: 'avoid' }}>
                <Skeleton
                  variant='rectangular'
                  width='100%'
                  height={heights[i]}
                  sx={{ borderRadius: '16px' }}
                />
              </Box>
            )
          })}
        </Box>
      ) : (
        <>
          <Box sx={{ columnCount: { xs: 1, sm: 2, md: 3 }, columnGap: 2 }}>
            <AnimatePresence mode='popLayout'>
              {visibleImages.map((img, i) => (
                <GalleryCard key={img.id} image={img} index={i} onClick={onClick} />
              ))}
            </AnimatePresence>
          </Box>

          {/* Infinite scroll sentinel + loader */}
          {hasMore && (
            <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              {sectionLoading && (
                <Box sx={{ columnCount: { xs: 1, sm: 2, md: 3 }, columnGap: 2, width: '100%' }}>
                  {[...Array(3)].map((_, i) => (
                    <Box key={i} sx={{ mb: 2, breakInside: 'avoid' }}>
                      <Skeleton variant='rectangular' width='100%' height={240} sx={{ borderRadius: '16px' }} />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Empty state */}
          {visibleImages.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Icon icon='tabler:photo-off' fontSize={48} style={{ color: c.textDisabled }} />
              <Typography sx={{ color: c.textSecondary, mt: 2 }}>
                No images in this section yet.
              </Typography>
            </Box>
          )}

          {/* End of section */}
          {!hasMore && visibleImages.length > 0 && (
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              sx={{ textAlign: 'center', py: 4 }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 3,
                  py: 1,
                  borderRadius: '100px',
                  bgcolor: alpha(c.textDisabled, 0.06),
                  border: `1px solid ${alpha(c.textDisabled, 0.1)}`
                }}
              >
                <Icon icon='tabler:checks' fontSize={16} style={{ color: c.textDisabled }} />
                <Typography variant='body2' sx={{ color: c.textDisabled, fontWeight: 500 }}>
                  All {images.length} images shown
                </Typography>
              </Box>
            </MotionBox>
          )}
        </>
      )}
    </Box>
  )
}

/* ── Main View ──────────────────────────────────────────────── */

/* ── Gallery Skeleton ──────────────────────────────────────── */
function GallerySkeleton() {
  const c = useAppPalette()

  return (
    <>
      {/* ── Hero Skeleton ─────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 14, md: 20 },
          pb: { xs: 6, md: 10 },
          overflow: 'hidden'
        }}
      >
        <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Badge skeleton */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Skeleton width={200} height={36} sx={{ borderRadius: '100px' }} />
          </Box>

          {/* Title skeleton */}
          <Skeleton width={{ xs: '80%', md: '60%' }} height={80} sx={{ borderRadius: '8px', mx: 'auto', mb: 3 }} />

          {/* Description skeleton - 3 lines */}
          <Box sx={{ maxWidth: 620, mx: 'auto' }}>
            <Skeleton width='100%' height={24} sx={{ borderRadius: '8px', mb: 1.5 }} />
            <Skeleton width='95%' height={24} sx={{ borderRadius: '8px', mb: 1.5 }} />
            <Skeleton width='85%' height={24} sx={{ borderRadius: '8px' }} />
          </Box>
        </Container>
      </Box>

      {/* ── Tab Skeletons ─────────────────────────────────────────────── */}
      <Container maxWidth='lg' sx={{ pb: { xs: 6, md: 10 } }}>
        {/* Category tabs skeleton */}
        <Box sx={{ display: 'flex', gap: 2, mb: 6 }}>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant='rectangular' width={{ xs: 100, md: 140 }} height={48} sx={{ borderRadius: '100px' }} />
          ))}
        </Box>

        {/* Masonry grid skeleton - 9 cards with staggered heights */}
        <Box sx={{ columnCount: { xs: 1, sm: 2, md: 3 }, columnGap: 2 }}>
          {[...Array(9)].map((_, i) => {
            const heights = [200, 250, 300, 220, 280, 240, 260, 240, 270]
            return (
              <Box key={i} sx={{ mb: 2, breakInside: 'avoid' }}>
                <Skeleton
                  variant='rectangular'
                  width='100%'
                  height={heights[i]}
                  sx={{ borderRadius: '16px' }}
                />
              </Box>
            )
          })}
        </Box>
      </Container>
    </>
  )
}

/* ── Category Tabs Component ────────────────────────────── */

function CategoryTabs({ categories, selected, onSelect }) {
  const c = useAppPalette()
  const scrollRef = useRef(null)

  return (
    <Box
      ref={scrollRef}
      sx={{
        display: 'flex',
        gap: 2,
        justifyContent: 'center',
        pb: 2,
        mb: 7,
        scrollBehavior: 'smooth',
        mt: -2
      }}
    >
      {categories.map(category => (
        <MotionBox
          key={category.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(category.id)}
          sx={{
            flex: '0 0 auto',
            px: 3,
            py: 1.5,
            borderRadius: '5px',
            cursor: 'pointer',
            backgroundColor: selected === category.id ? c.primary : alpha(c.primary, 0.08),
            border: `2px solid ${selected === category.id ? c.primary : alpha(c.primary, 0.2)}`,
            color: selected === category.id ? c.white : c.textPrimary,
            fontWeight: selected === category.id ? 700 : 600,
            fontSize: '0.95rem',
            transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            '&:hover': {
              backgroundColor: selected === category.id ? c.primary : alpha(c.primary, 0.15),
              borderColor: c.primary
            }
          }}
        >
          {category.label}
          {category.count > 0 && (
            <Typography
              component='span'
              sx={{
                ml: 1,
                fontSize: '0.85rem',
                opacity: 0.8,
                fontWeight: 500
              }}
            >
              ({category.count})
            </Typography>
          )}
        </MotionBox>
      ))}
    </Box>
  )
}

/* ── Main View ──────────────────────────────────────────────── */

export default function GalleryView() {
  const c = useAppPalette()
  const [allImages, setAllImages] = useState([])
  const [categories, setCategories] = useState([
    { id: 'citronics', label: 'Citronics', count: 0 },
    { id: 'flash-mob', label: 'Flash Mob', count: 0 }
  ])
  const [selectedCategory, setSelectedCategory] = useState('citronics')
  const [lightboxImage, setLightboxImage] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)

  // Fetch gallery images from API
  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch('/api/media/gallery')
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          const images = json.data.map(item => ({
            id: item.id,
            url: item.links,
            title: item.name || '',
            post: item.post,
            category: item.post === 'flash-mob' ? 'Flash Mob' : 'Citronics'
          }))
          setAllImages(images)

          // Count images by category
          const citronicsCount = images.filter(img => !img.post || img.post !== 'flash-mob').length
          const flashMobCount = images.filter(img => img.post === 'flash-mob').length

          setCategories([
            { id: 'citronics', label: 'CITRONICS 2K25'},
            { id: 'flash-mob', label: 'FLASH MOB' }
          ])
        }
      } catch (err) {
        console.error('Failed to load gallery images', err)
      } finally {
        setInitialLoading(false)
      }
    }
    fetchGallery()
  }, [])

  // Filter images based on selected category
  const filteredImages = allImages.filter(img => {
    if (selectedCategory === 'flash-mob') {
      return img.post === 'flash-mob'
    } else {
      // Citronics category
      return !img.post || img.post !== 'flash-mob'
    }
  })

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 14, md: 20 },
          pb: { xs: 6, md: 10 },
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '50vw',
            height: '50vw',
            maxWidth: 700,
            maxHeight: 700,
            borderRadius: '2px',
            background: `radial-gradient(circle, ${alpha(c.primary, 0.1)} 0%, transparent 70%)`,
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 0.75,
                borderRadius: '100px',
                background: alpha(c.primary, 0.08),
                border: `1px solid ${alpha(c.primary, 0.2)}`,
                mb: 3
              }}
            >
              <Icon icon='tabler:camera' fontSize={14} style={{ color: c.primary }} />
              <Typography variant='caption' sx={{ color: c.primary, fontWeight: 700, letterSpacing: 1.5 }}>
                MOMENTS CAPTURED
              </Typography>
            </Box>

            <Typography
              variant='h1'
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                letterSpacing: '-1.5px',
                lineHeight: 1.05,
                mb: 3,
                background: `linear-gradient(135deg, ${c.textPrimary} 0%, ${c.primary} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Gallery
            </Typography>

            <Typography
              variant='body1'
              sx={{
                color: c.textSecondary,
                maxWidth: 620,
                mx: 'auto',
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.125rem' }
              }}
            >
              Relive the energy, creativity, and brilliance of Citronics through our curated
              collection of moments from past and present editions.
            </Typography>
          </MotionBox>
        </Container>
      </Box>

      {/* ── Gallery Sections ──────────────────────────────── */}
      <Container maxWidth='lg' sx={{ pb: { xs: 6, md: 10 } }}>
        {initialLoading ? (
          <GallerySkeleton />
        ) : (
          <>
            {/* Category Tabs */}
            {allImages.length > 0 && (
              <CategoryTabs
                categories={categories}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            )}

            {/* Filtered Gallery based on selected category */}
            {filteredImages.length > 0 ? (
              <Box sx={{ columnCount: { xs: 1, sm: 2, md: 3 }, columnGap: 1.5 }}>
                <AnimatePresence mode='popLayout'>
                  {filteredImages.map((img, i) => (
                    <GalleryCard key={img.id} image={img} index={i} onClick={setLightboxImage} />
                  ))}
                </AnimatePresence>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Icon icon='tabler:photo-off' fontSize={48} style={{ color: c.textDisabled }} />
                <Typography sx={{ color: c.textSecondary, mt: 2 }}>
                  No images available in this category yet.
                </Typography>
              </Box>
            )}

            {/* No images at all state */}
            {allImages.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Icon icon='tabler:photo-off' fontSize={48} style={{ color: c.textDisabled }} />
                <Typography sx={{ color: c.textSecondary, mt: 2 }}>
                  No gallery images available yet.
                </Typography>
              </Box>
            )}
          </>
        )}
      </Container>

      {/* ── Lightbox ─────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxImage && <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />}
      </AnimatePresence>
    </>
  )
}