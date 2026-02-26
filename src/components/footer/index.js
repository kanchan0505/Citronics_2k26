import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Link from 'next/link'
import { alpha } from '@mui/material/styles'
import Icon from 'src/components/Icon'
import { useAppPalette } from 'src/components/palette'
import themeConfig from 'src/configs/themeConfig'

// ── Data ──────────────────────────────────────────────────────────────────────

const LINK_COLUMN_1 = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Ticketing Terms & Conditions', href: '/terms-ticketing' },
  { label: 'Privacy Policy', href: '/privacy' }
]

const LINK_COLUMN_2 = [
  { label: 'Social Media Disclaimer', href: '/social-disclaimer' },
  { label: 'Terms of Use', href: '/terms' },
  { label: 'Accessibility Statement', href: '/accessibility' }
]

const SOCIAL_LINKS = [
  { icon: 'tabler:brand-facebook', href: '#', label: 'Facebook' },
  { icon: 'tabler:brand-x', href: '#', label: 'X (Twitter)' },
  { icon: 'tabler:brand-instagram', href: '#', label: 'Instagram' }
]

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Footer — Professional SILO-Dallas–style footer
 *
 * Layout (top → bottom):
 *  1. Rounded-corner container card with:
 *     - Left: Logo + address + phone number
 *     - Center-Right: Two columns of legal / policy links
 *  2. Bottom bar:
 *     - Left: © copyright
 *     - Center: social icons
 *     - Right: college/event badge + descriptor
 *
 * Theme-aware: uses `useAppPalette()` — no hard-coded colors.
 * Fully responsive (stacks on mobile).
 */
export default function Footer() {
  const c = useAppPalette()

  /* Adaptive footer card background — slightly elevated from page bg */
  const cardBg = c.isDark
    ? alpha(c.bgPaper, 0.55)
    : alpha(c.grey[100], 0.7)

  const cardBorder = c.isDark
    ? `1px solid ${c.primaryA15}`
    : `1px solid ${c.primaryA12}`

  /* Link text color */
  const linkColor = c.isDark ? c.whiteA65 : c.textSecondary

  return (
    <Box
      component='footer'
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent',
        pt: { xs: 4, md: 6 },
        pb: 0,
        mx: { xs: 2, sm: 3, md: 4 }
      }}
    >
      {/* ─────────────── Main card ─────────────────────────────────────── */}
      <Box
        sx={{
          borderRadius: { xs: '20px', md: '28px' },
          border: cardBorder,
          bgcolor: cardBg,
          backdropFilter: 'blur(16px)',
          px: { xs: 3, sm: 5, md: 7 },
          pt: { xs: 5, md: 7 },
          pb: { xs: 4, md: 6 }
        }}
      >
          {/* ── Upper section: logo + address | link columns ─────────── */}
          <Grid container spacing={{ xs: 5, md: 4 }}>
            {/* Left — Logo + Address + Phone */}
            <Grid item xs={12} md={5}>
              {/* Logo */}
              <Box
                component='img'
                src={c.isDark ? themeConfig.appLogoInvert : themeConfig.appLogo}
                alt={themeConfig.templateName}
                sx={{
                  height: { xs: 36, md: 42 },
                  width: 'auto',
                  mb: 3,
                  objectFit: 'contain'
                }}
              />

              <Typography
                variant='h5'
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.35,
                  color: c.textPrimary,
                  mb: 1
                }}
              >
                Chameli  Devi  Group  Of  Institution
                <br />
                Indore, Madhya Pradesh — 452020
              </Typography>

              <Typography
                variant='h6'
                component='a'
                href='tel:+919876543210'
                sx={{
                  fontWeight: 600,
                  color: c.primary,
                  textDecoration: 'none',
                  display: 'inline-block',
                  mt: 1,
                  transition: 'opacity 0.2s',
                  '&:hover': { opacity: 0.8 }
                }}
              >
                +91 98765 43210
              </Typography>
            </Grid>

            {/* Right — Two link columns */}
            <Grid item xs={12} md={7}>
              <Grid container spacing={{ xs: 3, sm: 4 }}>
                {/* Column 1 */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2, pt: { xs: 0, md: 1 } }}>
                    {LINK_COLUMN_1.map(link => (
                      <Link key={link.label} href={link.href} passHref legacyBehavior>
                        <Typography
                          component='a'
                          variant='body1'
                          sx={{
                            color: linkColor,
                            textDecoration: 'none',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontSize: { xs: '0.82rem', md: '0.88rem' },
                            transition: 'color 0.2s',
                            '&:hover': { color: c.primary }
                          }}
                        >
                          {link.label}
                        </Typography>
                      </Link>
                    ))}
                  </Box>
                </Grid>

                {/* Column 2 */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2, pt: { xs: 0, md: 1 } }}>
                    {LINK_COLUMN_2.map(link => (
                      <Link key={link.label} href={link.href} passHref legacyBehavior>
                        <Typography
                          component='a'
                          variant='body1'
                          sx={{
                            color: linkColor,
                            textDecoration: 'none',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontSize: { xs: '0.82rem', md: '0.88rem' },
                            transition: 'color 0.2s',
                            '&:hover': { color: c.primary }
                          }}
                        >
                          {link.label}
                        </Typography>
                      </Link>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* ── Divider ──────────────────────────────────────────────── */}
          <Divider
            sx={{
              borderColor: c.isDark ? c.whiteA10 : c.primaryA12,
              my: { xs: 4, md: 5 }
            }}
          />

          {/* ── Bottom bar: copyright | social | badge ───────────────── */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'center', md: 'flex-start' },
              justifyContent: 'space-between',
              gap: { xs: 3.5, md: 2 },
              textAlign: { xs: 'center', md: 'left' }
            }}
          >
            {/* Left — Copyright */}
            <Typography
              variant='body2'
              sx={{
                color: c.isDark ? c.whiteA40 : c.textPrimaryA50,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                order: { xs: 3, md: 1 }
              }}
            >
              © {new Date().getFullYear()} {themeConfig.templateName}
            </Typography>

            {/* Center — Social icons */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                order: { xs: 1, md: 2 }
              }}
            >
              {SOCIAL_LINKS.map(s => (
                <IconButton
                  key={s.label}
                  component='a'
                  href={s.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label={s.label}
                  size='small'
                  sx={{
                    color: c.isDark ? c.whiteA65 : c.textSecondary,
                    border: `1px solid ${c.isDark ? c.whiteA15 : c.primaryA12}`,
                    width: 38,
                    height: 38,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      color: c.primary,
                      borderColor: c.primaryA50,
                      bgcolor: c.primaryA8,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 14px ${c.primaryA20}`
                    }
                  }}
                >
                  <Icon icon={s.icon} fontSize={18} />
                </IconButton>
              ))}
            </Box>

            {/* Right — College / Event badge */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', md: 'flex-end' },
                order: { xs: 2, md: 3 }
              }}
            >
              <Box
                component='img'
                src={c.isDark ? themeConfig.appLogoInvert : themeConfig.appLogo}
                alt={`${themeConfig.templateName} Badge`}
                sx={{
                  height: { xs: 44, md: 52 },
                  width: 'auto',
                  objectFit: 'contain',
                  mb: 1
                }}
              />
              <Typography
                variant='caption'
                sx={{
                  color: c.isDark ? c.whiteA40 : c.textPrimaryA50,
                  fontWeight: 600,
                  textAlign: { xs: 'center', md: 'right' },
                  lineHeight: 1.45,
                  maxWidth: 180
                }}
              >
                CDGI Technical Fest
                <br />
                Event Management
              </Typography>
            </Box>
          </Box>
        </Box>

      {/* Spacer below the card */}
      <Box sx={{ height: { xs: 16, md: 24 } }} />
    </Box>
  )
}
