import { useState, useEffect, useMemo } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { alpha } from '@mui/material/styles'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'

const MotionBox = motion(Box)

/* ── IPFS resolver ──────────────────────────────────────────── */

const resolveIpfs = link => {
  if (!link) return null
  const gw = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs'
  try {
    const u = new URL(link)
    if (u.protocol === 'http:' || u.protocol === 'https:') return link
  } catch (_) {}
  if (link.startsWith('ipfs://')) return `${gw}/${link.replace('ipfs://', '')}`
  if (/^(bafy|Qm)[A-Za-z0-9]+/i.test(link)) return `${gw}/${link}`
  return link
}

/* ── Accent color per post ──────────────────────────────────── */

const POST_COLORS = {
  president: 'warning',
  'vice president': 'primary',
  prm: 'info',
  discipline: 'error'
}

const getAccent = (post, c) => {
  const key = (post || '').toLowerCase().trim()
  if (POST_COLORS[key]) return c[POST_COLORS[key]]
  if (key.startsWith('gs')) return c.success
  return c.info
}

/* ── Ordering ───────────────────────────────────────────────── */

const POST_PRIORITY = { president: 0, 'vice president': 1, prm: 2, discipline: 3 }

const priority = post => {
  const k = (post || '').toLowerCase().trim()
  if (k in POST_PRIORITY) return POST_PRIORITY[k]
  if (k.startsWith('gs')) return 4
  return 5
}



/* ── Section divider with label ─────────────────────────────── */

function SectionHeader({ icon, label, color, count }) {
  const c = useAppPalette()
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1.5 }}>
        <Box sx={{ flex: 1, maxWidth: 80, height: '1px', background: `linear-gradient(90deg, transparent, ${alpha(color, 0.4)})` }} />
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 2.5,
            py: 0.75,
            borderRadius: '100px',
            background: alpha(color, 0.08),
            border: `1px solid ${alpha(color, 0.2)}`
          }}
        >
          <Icon icon={icon} fontSize={15} style={{ color }} />
          <Typography variant='caption' sx={{ color, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', fontSize: '0.7rem' }}>
            {label}
          </Typography>
          {count > 0 && (
            <Box
              sx={{
                ml: 0.5,
                minWidth: 20,
                height: 20,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: alpha(color, 0.15),
                fontSize: '0.65rem',
                fontWeight: 800,
                color
              }}
            >
              {count}
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1, maxWidth: 80, height: '1px', background: `linear-gradient(90deg, ${alpha(color, 0.4)}, transparent)` }} />
      </Box>
    </MotionBox>
  )
}

/* ════════════════════════════════════════════════════════════
   President Card — large featured card, top of page
   ════════════════════════════════════════════════════════════ */

function PresidentCard({ member }) {
  const c = useAppPalette()
  const acc = c.warning

  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        position: 'relative',
        maxWidth: { xs: '100%', sm: 500 },
        mx: 'auto',
        borderRadius: '28px',
        overflow: 'hidden',
        background: c.isDark
          ? `linear-gradient(160deg, ${alpha(acc, 0.08)} 0%, ${alpha(c.bgPaper, 0.6)} 50%, ${alpha(acc, 0.04)} 100%)`
          : `linear-gradient(160deg, ${alpha(acc, 0.06)} 0%, ${alpha('#fff', 0.9)} 50%, ${alpha(acc, 0.03)} 100%)`,
        border: `1.5px solid ${alpha(acc, 0.2)}`,
        backdropFilter: 'blur(24px)',
        transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 32px 80px ${alpha(acc, 0.18)}, 0 0 0 1px ${alpha(acc, 0.15)}`,
          border: `1.5px solid ${alpha(acc, 0.4)}`
        }
      }}
    >
      <Box sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', position: 'relative' }}>
        {/* Avatar */}
        <Box
          sx={{
            position: 'relative',
            width: '60%',
            maxWidth: 220,
            aspectRatio: '1',
            mx: 'auto',
            mb: 3,
            borderRadius: '50%',
            p: '4px',
            background: `conic-gradient(${acc}, ${alpha(acc, 0.2)}, ${acc})`
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              background: c.bgPaper
            }}
          >
            {member.links ? (
              <Box
                component='img'
                src={resolveIpfs(member.links)}
                alt={member.name}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: alpha(acc, 0.08),
                  fontSize: 64,
                  fontWeight: 800,
                  color: acc
                }}
              >
                {(member.name || '?')[0].toUpperCase()}
              </Box>
            )}
          </Box>
        </Box>

        {/* Name */}
        <Typography
          variant='h5'
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.3px',
            mb: 1,
            background: `linear-gradient(135deg, ${c.textPrimary}, ${acc})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {member.name}
        </Typography>

        {/* Badge */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 2,
            py: 0.5,
            borderRadius: '100px',
            background: alpha(acc, 0.12),
            border: `1px solid ${alpha(acc, 0.25)}`,
            mb: 2
          }}
        >
          <Icon icon='tabler:star-filled' style={{ fontSize: 12, color: acc }} />
          <Typography variant='caption' sx={{ color: acc, fontWeight: 800, letterSpacing: 1, fontSize: '0.72rem' }}>
            {member.post}
          </Typography>
        </Box>

        {/* Description */}
        {member.description && (
          <Typography variant='body2' sx={{ color: c.textSecondary, fontSize: '0.88rem', lineHeight: 1.6 }}>
            {member.description}
          </Typography>
        )}
      </Box>
    </MotionBox>
  )
}

/* ════════════════════════════════════════════════════════════
   Standard Member Card — glass morphism with image + details
   ════════════════════════════════════════════════════════════ */

function MemberCard({ member, index, variant = 'default' }) {
  const c = useAppPalette()
  const acc = getAccent(member.post, c)
  const isVP = variant === 'vp'

  return (
    <MotionBox
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        position: 'relative',
        height: '100%',
        borderRadius: '22px',
        overflow: 'hidden',
        background: c.isDark
          ? `linear-gradient(180deg, ${alpha(acc, 0.04)} 0%, ${alpha(c.bgPaper, 0.55)} 100%)`
          : `linear-gradient(180deg, ${alpha(acc, 0.03)} 0%, ${alpha('#fff', 0.85)} 100%)`,
        border: `1px solid ${alpha(acc, 0.12)}`,
        backdropFilter: 'blur(20px)',
        transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
        cursor: 'default',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: `0 24px 64px ${alpha(acc, 0.14)}`,
          border: `1px solid ${alpha(acc, 0.35)}`,
          '& .card-accent-bar': { opacity: 1 },
          '& .card-avatar-ring': {
            background: `linear-gradient(135deg, ${acc}, ${alpha(acc, 0.3)})`
          }
        }
      }}
    >
      {/* Accent bar top */}
      <Box
        className='card-accent-bar'
        sx={{
          height: 2.5,
          background: `linear-gradient(90deg, transparent, ${acc}, transparent)`,
          opacity: 0,
          transition: 'opacity 0.35s ease'
        }}
      />

      <Box sx={{ p: { xs: 3, sm: 3.5, md: 4 }, pb: { xs: 3.5, md: 5 }, textAlign: 'center' }}>
        {/* Avatar */}
        <Box
          className='card-avatar-ring'
          sx={{
            width: '75%',
            maxWidth: isVP ? 180 : 170,
            aspectRatio: '1',
            mx: 'auto',
            mb: 2.5,
            borderRadius: '50%',
            p: '3px',
            background: `linear-gradient(135deg, ${alpha(acc, 0.5)}, ${alpha(acc, 0.12)})`,
            transition: 'background 0.35s ease'
          }}
        >
          <Box sx={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: c.bgPaper }}>
            {member.links ? (
              <Box
                component='img'
                src={resolveIpfs(member.links)}
                alt={member.name}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: c.isDark ? alpha(acc, 0.08) : alpha(acc, 0.05),
                  fontSize: isVP ? 44 : 36,
                  fontWeight: 800,
                  color: acc
                }}
              >
                {(member.name || '?')[0].toUpperCase()}
              </Box>
            )}
          </Box>
        </Box>

        {/* Name */}
        <Typography
          variant={isVP ? 'h6' : 'subtitle1'}
          sx={{ fontWeight: 700, fontSize: isVP ? '1.15rem' : '1.05rem', mb: 0.75, color: c.textPrimary, lineHeight: 1.3 }}
        >
          {member.name}
        </Typography>

        {/* Post pill */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.3,
            borderRadius: '100px',
            background: alpha(acc, 0.1),
            border: `1px solid ${alpha(acc, 0.18)}`,
            mb: 1
          }}
        >
          <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: acc }} />
          <Typography variant='caption' sx={{ color: acc, fontWeight: 700, letterSpacing: 0.4, fontSize: '0.72rem' }}>
            {member.post}
          </Typography>
        </Box>

        {/* Branch / description */}
        {member.description && (
          <Typography variant='body2' sx={{ color: c.textSecondary, fontSize: '0.85rem', mt: 0.75, lineHeight: 1.6 }}>
            {member.description}
          </Typography>
        )}
      </Box>
    </MotionBox>
  )
}

/* ── Loading skeleton ───────────────────────────────────────── */

function CardSkeleton() {
  const c = useAppPalette()
  return (
    <Box sx={{ p: 3, borderRadius: '22px', background: alpha(c.bgPaper, 0.4), textAlign: 'center' }}>
      <Skeleton variant='circular' width={120} height={120} sx={{ mx: 'auto', mb: 2 }} />
      <Skeleton width='60%' sx={{ mx: 'auto', mb: 1 }} />
      <Skeleton width='40%' sx={{ mx: 'auto', mb: 1 }} />
      <Skeleton width='50%' sx={{ mx: 'auto' }} />
    </Box>
  )
}

/* ════════════════════════════════════════════════════════════
   Main View
   ════════════════════════════════════════════════════════════ */

export default function CoreTeamView() {
  const c = useAppPalette()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/media/team')
      .then(r => r.json())
      .then(res => {
        if (res.success) setMembers(res.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const president = useMemo(() => members.filter(m => (m.post || '').toLowerCase().trim() === 'president'), [members])
  const vicePresidents = useMemo(() => members.filter(m => (m.post || '').toLowerCase().trim() === 'vice president'), [members])

  // PRM and Discipline as separate rows
  const prmMembers = useMemo(() => members.filter(m => (m.post || '').toLowerCase().trim() === 'prm'), [members])
  const disciplineMembers = useMemo(() => members.filter(m => {
    const p = (m.post || '').toLowerCase().trim()
    return p === 'discipline' || p === 'disciplne'
  }), [members])

  // All GS members merged under one heading
  const gsMembers = useMemo(() => members
    .filter(m => (m.post || '').toLowerCase().trim().startsWith('gs'))
    .sort((a, b) => (a.post || '').localeCompare(b.post || '')),
  [members])

  return (
    <>
      {/* ══════════════ Hero ══════════════════════════════════ */}
      <Box
        sx={{
          position: 'relative',
          pt: { xs: 14, md: 20 },
          pb: { xs: 6, md: 10 },
          overflow: 'hidden'
        }}
      >
        {/* Grid pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(${alpha(c.primary, 0.04)} 1px, transparent 1px),
              linear-gradient(90deg, ${alpha(c.primary, 0.04)} 1px, transparent 1px)
            `,
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 100%)',
            zIndex: 0
          }}
        />

        {/* Glow blobs */}
        <Box
          sx={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(c.primary, 0.12)} 0%, transparent 70%)`,
            top: '-15%',
            left: '30%',
            filter: 'blur(80px)',
            pointerEvents: 'none'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(c.info, 0.08)} 0%, transparent 70%)`,
            top: '10%',
            right: '15%',
            filter: 'blur(70px)',
            pointerEvents: 'none'
          }}
        />

        <Container maxWidth='md' sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <MotionBox initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
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
              <Icon icon='tabler:users-group' fontSize={14} style={{ color: c.primary }} />
              <Typography variant='caption' sx={{ color: c.primary, fontWeight: 800, letterSpacing: 1.5 }}>
                CITRONICS 2K26
              </Typography>
            </Box>

            <Typography
              variant='h1'
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                letterSpacing: '-2px',
                lineHeight: 1.05,
                mb: 2.5,
                background: c.gradientPrimary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Meet Our Team
            </Typography>

            <Typography
              variant='body1'
              sx={{
                color: c.textSecondary,
                maxWidth: 580,
                mx: 'auto',
                lineHeight: 1.85,
                fontSize: { xs: '1rem', md: '1.1rem' }
              }}
            >
              The driving force behind Central India's largest Techno-Management Fest — dedicated individuals who turn vision into reality.
            </Typography>

            {/* Stats row */}
            {!loading && members.length > 0 && (
              <MotionBox
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 3, md: 5 }, mt: 4 }}
              >
                {[
                  { n: members.length, l: 'Members' },
                  { n: new Set(members.map(m => (m.post || '').trim())).size, l: 'Positions' },
                  { n: new Set(members.map(m => (m.description || '').split('—')[0]?.trim()).filter(Boolean)).size, l: 'Branches' }
                ].map((s, i) => (
                  <Box key={i} sx={{ textAlign: 'center' }}>
                    <Typography variant='h4' sx={{ fontWeight: 800, color: c.primary, letterSpacing: '-0.5px' }}>
                      {s.n}
                    </Typography>
                    <Typography variant='caption' sx={{ color: c.textDisabled, fontWeight: 600, letterSpacing: 0.8 }}>
                      {s.l}
                    </Typography>
                  </Box>
                ))}
              </MotionBox>
            )}
          </MotionBox>
        </Container>
      </Box>

      {/* ══════════════ Loading state ════════════════════════ */}
      {loading && (
        <Container maxWidth='lg' sx={{ py: 6 }}>
          <Grid container spacing={{ xs: 2, md: 3 }} justifyContent='center'>
            {[...Array(10)].map((_, i) => (
              <Grid item xs={6} sm={6} md={4} lg={3} key={i}>
                <CardSkeleton />
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      <AnimatePresence>
        {!loading && members.length > 0 && (
          <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {/* ═══════════ President ═══════════════════════════ */}
            {president.length > 0 && (
              <Box sx={{ py: { xs: 4, md: 6 }, position: 'relative' }}>
                <SectionHeader icon='tabler:crown' label='President' color={c.warning} count={0} />
                <Container maxWidth='sm'>
                  {president.map(m => (
                    <PresidentCard key={m.id} member={m} />
                  ))}
                </Container>
              </Box>
            )}

            {/* ═══════════ Vice Presidents ═════════════════════ */}
            {vicePresidents.length > 0 && (
              <Box
                sx={{
                  py: { xs: 5, md: 7 },
                  position: 'relative',
                  bgcolor: c.isDark ? alpha(c.bgPaper, 0.2) : alpha(c.bgPaper, 0.45)
                }}
              >
                <SectionHeader icon='tabler:shield-star' label='Vice Presidents' color={c.primary} count={vicePresidents.length} />
                <Container maxWidth='lg'>
                  <Grid container spacing={{ xs: 2, md: 3 }} justifyContent='center'>
                    {vicePresidents.map((m, i) => (
                      <Grid item xs={6} sm={6} md={4} lg={3} key={m.id}>
                        <MemberCard member={m} index={i} variant='vp' />
                      </Grid>
                    ))}
                  </Grid>
                </Container>
              </Box>
            )}

            {/* ═══════════ PRM & Discipline ═══════════════════ */}
            {(prmMembers.length > 0 || disciplineMembers.length > 0) && (
              <Box sx={{ py: { xs: 5, md: 7 }, position: 'relative' }}>
                <SectionHeader icon='tabler:shield-check' label='PRM & Discipline' color={c.info} count={prmMembers.length + disciplineMembers.length} />
                <Container maxWidth='lg'>
                  <Grid container spacing={{ xs: 2, md: 3 }} justifyContent='center'>
                    {[...prmMembers, ...disciplineMembers].map((m, i) => (
                      <Grid item xs={6} sm={6} md={4} lg={3} key={m.id}>
                        <MemberCard member={m} index={i} />
                      </Grid>
                    ))}
                  </Grid>
                </Container>
              </Box>
            )}

            {/* ═══════════ General Secretaries (GS) ════════════ */}
            {gsMembers.length > 0 && (
              <Box sx={{ py: { xs: 5, md: 7 }, position: 'relative' }}>
                <SectionHeader icon='tabler:users' label='General Secretaries' color={c.success} count={gsMembers.length} />
                <Container maxWidth='lg'>
                  <Grid container spacing={{ xs: 2, md: 2.5 }} justifyContent='center'>
                    {gsMembers.map((m, i) => (
                      <Grid item xs={6} sm={6} md={4} lg={3} key={m.id}>
                        <MemberCard member={m} index={i} />
                      </Grid>
                    ))}
                  </Grid>
                </Container>
              </Box>
            )}
          </MotionBox>
        )}
      </AnimatePresence>

      {/* ══════════════ Empty state ══════════════════════════ */}
      {!loading && members.length === 0 && (
        <Container maxWidth='sm' sx={{ py: 12, textAlign: 'center' }}>
          <Icon icon='tabler:users-minus' style={{ fontSize: 56, color: c.textDisabled, marginBottom: 16 }} />
          <Typography variant='h6' sx={{ color: c.textSecondary, fontWeight: 600 }}>
            Team data coming soon
          </Typography>
          <Typography variant='body2' sx={{ color: c.textDisabled, mt: 1 }}>
            Check back later for the full CITRONICS 2K26 team.
          </Typography>
        </Container>
      )}
    </>
  )
}
