import CssBaseline from '@mui/material/CssBaseline'
import GlobalStyles from '@mui/material/GlobalStyles'
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles'

import themeConfig from 'src/configs/themeConfig'
import themeOptions from './themeOptions'
import GlobalStyling from './globalStyles'

/**
 * Theme Component
 * Wraps the application with MUI ThemeProvider
 */
const AppThemeProvider = ({ settings, children }) => {
  // Create theme from options — pass the user's chosen mode as override
  const overrideMode = settings.mode === 'semi-dark' ? 'light' : settings.mode || 'light'
  let theme = createTheme(themeOptions(settings, overrideMode))

  // Apply responsive font sizes if enabled
  if (themeConfig.responsiveFontSizes) {
    theme = responsiveFontSizes(theme)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={() => GlobalStyling(theme)} />
      {children}
    </ThemeProvider>
  )
}

export default AppThemeProvider
