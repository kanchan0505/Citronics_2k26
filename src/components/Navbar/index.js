import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha, useTheme } from '@mui/material/styles'
import { Classic } from '@theme-toggles/react'
import '@theme-toggles/react/css/Classic.css'
import { IconMenu2, IconX, IconBell } from '@tabler/icons-react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import Icon from 'src/components/Icon'
import { useSettings } from 'src/hooks/useSettings'
import themeConfig from 'src/configs/themeConfig'

/**
 * Global Navbar — floating pill-style bar
 *
 * @param {Object} props
 * @param {Array}  props.navLinks  — optional array of { label, href } for section anchors
 * @param {string} props.activeSection — currently active anchor id (for highlight)
 * @param {Function} props.onNavClick — optional handler for anchor clicks
 */
const Navbar = ({ navLinks, activeSection, onNavClick }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { settings, saveSettings } = useSettings()
  const { data: session } = useSession()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profileAnchor, setProfileAnchor] = useState(null)

  const isDark = settings.mode === 'dark'

  const handleThemeToggle = () => {
    saveSettings({ ...settings, mode: isDark ? 'light' : 'dark' })
  }

  const handleProfileOpen = e => setProfileAnchor(e.currentTarget)
  const handleProfileClose = () => setProfileAnchor(null)

  const handleLogout = () => {
    setProfileAnchor(null)
    signOut({ callbackUrl: '/login' })
  }

  const handleAnchorClick = (e, href) => {
    if (onNavClick) {
      onNavClick(e, href)
    } else {
      e.preventDefault()
      const id = href.replace('#', '')
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setDrawerOpen(false)
  }

  return (
    <>
      {/* ── Floating Navbar ──────────────────────────────────────────────────── */}
      {settings.appBar !== 'hidden' && (
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            right: 16,
            zIndex: theme.zIndex.drawer + 2,
            display: 'flex',
            alignItems: 'center',
            height: 56,
            px: 2,
            gap: 0.5,
            borderRadius: '16px',
            bgcolor: settings.appBarBlur
              ? alpha(theme.palette.background.paper, isDark ? 0.6 : 0.75)
              : theme.palette.background.paper,
            backdropFilter: settings.appBarBlur ? 'blur(20px) saturate(200%)' : 'none',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            boxShadow: `0 4px 30px ${alpha(theme.palette.common.black, 0.06)}, 0 1px 4px ${alpha(theme.palette.common.black, 0.04)}`,
            transition: theme.transitions.create(['opacity'], { duration: 200 })
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: { xs: 1, md: 0 }, mr: { md: 3 } }}>
            <Box
              component={Link}
              href='/'
              sx={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 16px ${alpha(theme.palette.primary.main, 0.35)}`,
                flexShrink: 0,
                textDecoration: 'none'
              }}
            >
              <Icon icon='tabler:bolt' fontSize={18} style={{ color: '#fff' }} />
            </Box>
            <Box sx={{ lineHeight: 1 }}>
              <Typography
                variant='subtitle2'
                sx={{
                  fontWeight: 800,
                  lineHeight: 1,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.5px',
                  fontSize: '0.875rem'
                }}
              >
                {themeConfig.templateName?.toUpperCase() || 'CITRONICS'}
              </Typography>
              <Typography
                variant='caption'
                sx={{ color: 'text.disabled', lineHeight: 1, fontSize: '0.5rem', letterSpacing: '1.5px', display: 'block', mt: 0.25 }}
              >
                TECHNICAL FEST 2026
              </Typography>
            </Box>
          </Box>

          {/* Desktop nav links (optional — only if navLinks provided) */}
          {!isMobile && navLinks?.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexGrow: 1 }}>
              {navLinks.map(link => {
                const active = activeSection === link.href?.replace('#', '')

                return (
                  <Button
                    key={link.href}
                    component='a'
                    href={link.href}
                    onClick={e => handleAnchorClick(e, link.href)}
                    size='small'
                    sx={{
                      px: 1.75,
                      py: 0.625,
                      borderRadius: '10px',
                      fontSize: '0.8125rem',
                      fontWeight: active ? 600 : 400,
                      textTransform: 'none',
                      color: active ? 'primary.main' : 'text.secondary',
                      bgcolor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main'
                      }
                    }}
                  >
                    {link.label}
                  </Button>
                )
              })}
            </Box>
          )}

          {/* Spacer when no navLinks */}
          {(!navLinks || navLinks.length === 0) && <Box sx={{ flexGrow: 1 }} />}

          {/* ── Right actions ─────────────────────────────────────────────────── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, ml: 'auto' }}>
            {/* Theme toggle — Classic animated sun/moon */}
            <Tooltip title={isDark ? 'Switch to light' : 'Switch to dark'}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '& .navbar-theme-toggle': {
                    fontSize: '1.3rem',
                    color: theme.palette.text.secondary,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '50%',
                    transition: 'color 0.2s, background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.08)
                    }
                  }
                }}
              >
                <Classic
                  toggled={isDark}
                  onToggle={handleThemeToggle}
                  duration={500}
                  className='navbar-theme-toggle'
                />
              </Box>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title='Notifications'>
              <IconButton
                size='small'
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08) }
                }}
              >
                <IconBell size={19} />
              </IconButton>
            </Tooltip>

            {/* ── User Auth ── */}
            {session?.user ? (
              <>
                <Tooltip title='Account'>
                  <IconButton onClick={handleProfileOpen} size='small' sx={{ ml: 0.25 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.main',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s',
                        '&:hover': { boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}` }
                      }}
                    >
                      {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={profileAnchor}
                  open={Boolean(profileAnchor)}
                  onClose={handleProfileClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  slotProps={{
                    paper: {
                      elevation: 3,
                      sx: {
                        mt: 1.5,
                        minWidth: 200,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        overflow: 'visible',
                        '&::before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          borderLeft: `1px solid ${theme.palette.divider}`,
                          borderTop: `1px solid ${theme.palette.divider}`,
                          zIndex: 0
                        }
                      }
                    }
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant='subtitle2' fontWeight={600} noWrap>
                      {session.user.name || session.user.email}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' noWrap>
                      {session.user.role || 'Organizer'}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      gap: 1.5,
                      py: 1,
                      color: 'error.main',
                      '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) }
                    }}
                  >
                    <Icon icon='tabler:logout' fontSize={18} />
                    Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {!isMobile && (
                  <>
                    <Divider orientation='vertical' flexItem sx={{ mx: 0.75, height: 20, alignSelf: 'center', opacity: 0.4 }} />
                    <Button
                      variant='contained'
                      component={Link}
                      href='/login'
                      size='small'
                      sx={{
                        borderRadius: '10px',
                        px: 2.25,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        boxShadow: `0 0 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                        '&:hover': { boxShadow: `0 0 24px ${alpha(theme.palette.primary.main, 0.45)}` }
                      }}
                    >
                      Login
                    </Button>
                  </>
                )}
              </>
            )}

            {/* Mobile hamburger — only when navLinks exist */}
            {isMobile && navLinks?.length > 0 && (
              <IconButton
                size='small'
                onClick={() => setDrawerOpen(true)}
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08) } }}
              >
                <IconMenu2 size={20} />
              </IconButton>
            )}
          </Box>
        </Box>
      )}

      {/* ── Mobile Drawer (only with navLinks) ────────────────────────────────── */}
      {navLinks?.length > 0 && (
        <Drawer
          anchor='right'
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: 260,
              pt: 2,
              bgcolor: 'background.paper',
              backdropFilter: 'blur(20px)',
              borderLeft: `1px solid ${theme.palette.divider}`
            }
          }}
        >
          <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              variant='subtitle2'
              fontWeight={700}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {themeConfig.templateName?.toUpperCase() || 'CITRONICS'}
            </Typography>
            <IconButton size='small' onClick={() => setDrawerOpen(false)} sx={{ color: 'text.secondary' }}>
              <IconX size={18} />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 1 }} />
          <List>
            {navLinks.map(link => (
              <ListItemButton
                key={link.href}
                component='a'
                href={link.href}
                onClick={e => handleAnchorClick(e, link.href)}
                sx={{
                  borderRadius: '10px',
                  mx: 1,
                  mb: 0.5,
                  color: activeSection === link.href?.replace('#', '') ? 'primary.main' : 'text.primary',
                  bgcolor: activeSection === link.href?.replace('#', '') ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }
                }}
              >
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{ fontWeight: 500, fontSize: '0.875rem' }}
                />
              </ListItemButton>
            ))}
            {!session?.user && (
              <Box sx={{ px: 2, pt: 2 }}>
                <Button
                  fullWidth
                  variant='contained'
                  component={Link}
                  href='/login'
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: `0 0 16px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  Login
                </Button>
              </Box>
            )}
          </List>
        </Drawer>
      )}
    </>
  )
}

export default Navbar
