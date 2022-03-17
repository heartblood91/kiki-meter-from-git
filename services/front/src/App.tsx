import React from 'react'

import { BrowserRouter } from "react-router-dom"
import { MainRouter } from './router'

import {
  ThemeProvider,
  createTheme,
} from "@mui/material/styles"
import {
  CssBaseline,
  PaletteMode
} from "@mui/material"

const App = () => {
  const {
    theme,
    setDarkModeIsEnabled,
    is_dark_mode_enabled,
  } = useApp()

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MainRouter setDarkModeIsEnabled={setDarkModeIsEnabled} is_dark_mode_enabled={is_dark_mode_enabled}/>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App

const useApp = () => {
  const [is_dark_mode_enabled, setDarkModeIsEnabled] = React.useState<Boolean>(false)

  React.useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setDarkModeIsEnabled(true);
    }
  }, [])

  const theme_mode: PaletteMode = React.useMemo(() => {
    if (is_dark_mode_enabled) {
      return 'dark'
    } else {
      return 'light'
    }
  }, [is_dark_mode_enabled])

  const theme = React.useMemo(() => createTheme(getPaletteAcordingToMode(theme_mode)), [theme_mode])

  return {
    theme,
    setDarkModeIsEnabled,
    is_dark_mode_enabled,
  }
}

const getPaletteAcordingToMode = (mode: PaletteMode) => {
  return ({
    palette: {
      mode,
    },
  })
}
