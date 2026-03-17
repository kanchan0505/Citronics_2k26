import { useState, useCallback, useEffect } from 'react'

// MUI
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Fade from '@mui/material/Fade'
import Switch from '@mui/material/Switch'
import { styled, alpha } from '@mui/material/styles'

// Icons
import Icon from 'src/components/Icon'

// Hooks
import { useSettings } from 'src/hooks/useSettings'
import { useAppPalette } from 'src/components/palette'
import themeConfig from 'src/configs/themeConfig'

// ── Color Presets ──────────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { name: 'primary', label: 'Violet',  color: '#7367F0' },
  { name: 'info',    label: 'Cyan',    color: '#00CFE8' },
  { name: 'success', label: 'Green',   color: '#28C76F' },
  { name: 'error',   label: 'Rose',    color: '#EA5455' },
  { name: 'warning', label: 'Amber',   color: '#FF9F43' }
]

// ── Styled Components ──────────────────────────────────────────────────────────

const TriggerButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  right: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: theme.zIndex.drawer - 1,
  width: 42,
  height: 42,
  borderRadius: '10px 0 0 10px',
  backgroundColor: theme.palette.primary.main,
  color: '#fff',
  border: 'none',
  boxShadow: `-4px 0 20px ${alpha(theme.palette.primary.main, 0.5)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: `-6px 0 28px ${alpha(theme.palette.primary.main, 0.65)}`,
    width: 46
  }
}))

const ControlRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 1.5),
  borderRadius: 12,
  transition: 'background-color 0.15s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05)
  }
}))

const SectionCard = styled(Box)(({ theme }) => ({
  borderRadius: 14,
  border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
  overflow: 'hidden',
  marginBottom: theme.spacing(2)
}))

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1.25, 2),
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`
}))

// ── Component ──────────────────────────────────────────────────────────────────

const ThemeCustomizer = () => {
  const c = useAppPalette()
  const { settings, saveSettings } = useSettings()
  const [open, setOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onFS = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFS)
    return () => document.removeEventListener('fullscreenchange', onFS)
  }, [])

  const handleToggle  = useCallback(() => setOpen(p => !p), [])
  const handleClose   = useCallback(() => setOpen(false), [])

  const handleColorChange  = useCallback(preset => saveSettings({ ...settings, themeColor: preset.name }), [settings, saveSettings])
  const handleFullscreen   = useCallback(() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.() }, [])
  const handleAppBarBlur   = useCallback(() => saveSettings({ ...settings, appBarBlur: !settings.appBarBlur }), [settings, saveSettings])
  const handleAppBar       = useCallback(() => saveSettings({ ...settings, appBar: settings.appBar === 'hidden' ? 'fixed' : 'hidden' }), [settings, saveSettings])
  const handleModeToggle   = useCallback(() => saveSettings({ ...settings, mode: settings.mode === 'dark' ? 'light' : 'dark' }), [settings, saveSettings])
  const handleContentWidth = useCallback(() => saveSettings({ ...settings, contentWidth: settings.contentWidth === 'full' ? 'boxed' : 'full' }), [settings, saveSettings])

  const handleResetAll = useCallback(() => {
    saveSettings({
      mode: themeConfig.mode || 'light',
      themeColor: 'primary',
      contentWidth: themeConfig.contentWidth || 'full',
      appBar: themeConfig.appBar || 'fixed',
      appBarBlur: themeConfig.appBarBlur ?? true,
      fontSize: 14,
      direction: 'ltr'
    })
  }, [saveSettings])

  const isDark        = c.isDark
  const activePreset  = COLOR_PRESETS.find(p => p.name === (settings.themeColor || 'primary')) || COLOR_PRESETS[0]

  return (
    <>
      {/* Floating Trigger */}
      <Fade in={!open}>
        <TriggerButton onClick={handleToggle} aria-label='Open theme customizer'>
          <Icon icon='tabler:palette' fontSize={20} />
        </TriggerButton>
      </Fade>

      {/* Drawer */}
      <Drawer
        anchor='right'
        open={open}
        onClose={handleClose}
        variant='temporary'
        aria-label='Theme customizer'
        PaperProps={{
          sx: {
            width: 310,
            border: 'none',
            boxShadow: `-12px 0 48px ${alpha('#000', 0.18)}`,
            backgroundImage: 'none',
            bgcolor: 'background.default',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
        ModalProps={{ keepMounted: true }}
      >

        {/* ── Header ──────────────────────────────────────────── */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${alpha(c.divider, 0.8)}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                bgcolor: alpha(c.primary, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon icon='tabler:palette' fontSize={18} color={c.primary} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: c.textPrimary, lineHeight: 1.2 }}>
                Appearance
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: c.textSecondary, lineHeight: 1 }}>
                Customize your theme
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            size='small'
            sx={{
              color: c.textSecondary,
              bgcolor: alpha(c.textPrimary, 0.05),
              borderRadius: '8px',
              '&:hover': { bgcolor: alpha(c.textPrimary, 0.1), color: c.textPrimary }
            }}
          >
            <Icon icon='tabler:x' fontSize={16} />
          </IconButton>
        </Box>

        {/* ── Scrollable Content ───────────────────────────────── */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>

          {/* ── Section: Theme ─────────────────────────────────── */}
          <SectionCard>
            <SectionHeader>
              <Icon icon='tabler:sun-moon' fontSize={15} color={c.primary} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: c.textSecondary }}>
                Theme
              </Typography>
            </SectionHeader>
            <Box sx={{ p: 1 }}>
              <ControlRow>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: alpha(c.primary, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon={isDark ? 'tabler:moon-stars' : 'tabler:sun'} fontSize={16} color={c.primary} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: c.textPrimary, lineHeight: 1.2 }}>
                      {isDark ? 'Dark Mode' : 'Light Mode'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: c.textSecondary }}>
                      {isDark ? 'Switch to light' : 'Switch to dark'}
                    </Typography>
                  </Box>
                </Box>
                <Switch
                  checked={isDark}
                  onChange={handleModeToggle}
                  size='small'
                  sx={{ '& .MuiSwitch-thumb': { bgcolor: c.primary }, '& .MuiSwitch-track': { bgcolor: isDark ? alpha(c.primary, 0.5) : undefined } }}
                />
              </ControlRow>
            </Box>
          </SectionCard>

          {/* ── Section: Color ─────────────────────────────────── */}
          <SectionCard>
            <SectionHeader>
              <Icon icon='tabler:color-swatch' fontSize={15} color={c.primary} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: c.textSecondary }}>
                Accent Color
              </Typography>
            </SectionHeader>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1.5, mb: 1.5 }}>
                {COLOR_PRESETS.map(preset => (
                  <Tooltip key={preset.name} title={preset.label} arrow placement='top'>
                    <Box
                      onClick={() => handleColorChange(preset)}
                      role='button'
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && handleColorChange(preset)}
                      aria-label={`${preset.label} color`}
                      sx={{
                        aspectRatio: '1',
                        borderRadius: '10px',
                        bgcolor: preset.color,
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.2s',
                        outline: activePreset.name === preset.name ? `3px solid ${preset.color}` : '3px solid transparent',
                        outlineOffset: '2px',
                        boxShadow: activePreset.name === preset.name
                          ? `0 4px 16px ${alpha(preset.color, 0.5)}`
                          : `0 2px 8px ${alpha(preset.color, 0.2)}`,
                        '&:hover': { transform: 'scale(1.1)', boxShadow: `0 6px 20px ${alpha(preset.color, 0.5)}` },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {activePreset.name === preset.name && (
                        <Icon icon='tabler:check' fontSize={14} color='#fff' />
                      )}
                    </Box>
                  </Tooltip>
                ))}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: '8px',
                  bgcolor: alpha(activePreset.color, 0.08),
                  border: `1px solid ${alpha(activePreset.color, 0.2)}`
                }}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: activePreset.color, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: activePreset.color }}>
                  {activePreset.label}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: c.textSecondary, ml: 'auto', fontFamily: 'monospace' }}>
                  {activePreset.color}
                </Typography>
              </Box>
            </Box>
          </SectionCard>

          {/* ── Section: Display ─────────────────────────────────── */}
          <SectionCard>
            <SectionHeader>
              <Icon icon='tabler:layout' fontSize={15} color={c.primary} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: c.textSecondary }}>
                Display
              </Typography>
            </SectionHeader>
            <Box sx={{ p: 1 }}>

              {/* Fullscreen */}
              <ControlRow>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: alpha(c.primary, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon={isFullscreen ? 'tabler:arrows-minimize' : 'tabler:arrows-maximize'} fontSize={16} color={c.primary} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: c.textPrimary, lineHeight: 1.2 }}>
                      Fullscreen
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: c.textSecondary }}>
                      {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    </Typography>
                  </Box>
                </Box>
                <Switch
                  checked={isFullscreen}
                  onChange={handleFullscreen}
                  size='small'
                />
              </ControlRow>

              <Divider sx={{ my: 0.5, mx: 1 }} />

              {/* Navbar visibility */}
              <ControlRow>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: alpha(c.primary, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon icon={settings.appBar !== 'hidden' ? 'tabler:layout-navbar' : 'tabler:layout-navbar-inactive'} fontSize={16} color={c.primary} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: c.textPrimary, lineHeight: 1.2 }}>
                      Show Navbar
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: c.textSecondary }}>
                      Toggle top navigation bar
                    </Typography>
                  </Box>
                </Box>
                <Switch
                  checked={settings.appBar !== 'hidden'}
                  onChange={handleAppBar}
                  size='small'
                />
              </ControlRow>

              <Divider sx={{ my: 0.5, mx: 1 }} />

              {/* Navbar blur */}
              
              <Divider sx={{ my: 0.5, mx: 1 }} />

            

            </Box>
          </SectionCard>

        </Box>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <Box
          sx={{
            px: 2,
            py: 1.75,
            borderTop: `1px solid ${alpha(c.divider, 0.8)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: c.success }} />
            <Typography sx={{ fontSize: '0.7rem', color: c.textSecondary }}>
              Saved automatically
            </Typography>
          </Box>
          <Box
            onClick={handleResetAll}
            role='button'
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleResetAll()}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: '8px',
              cursor: 'pointer',
              border: `1px solid ${alpha(c.error, 0.3)}`,
              color: c.error,
              fontSize: '0.72rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              '&:hover': { bgcolor: alpha(c.error, 0.07), borderColor: c.error }
            }}
          >
            <Icon icon='tabler:refresh' fontSize={13} />
            Reset
          </Box>
        </Box>

      </Drawer>
    </>
  )
}

export { COLOR_PRESETS }

export default ThemeCustomizer
