import React from 'react'

import {
  Box,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
} from '@mui/material'

import MenuIcon from '@mui/icons-material/Menu'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ModeNightIcon from '@mui/icons-material/ModeNight'
import LightModeIcon from '@mui/icons-material/LightMode'

import AppBar from './MyAppBar'
import {
  Drawer,
  DrawerHeader,
} from './MyDrawer'
import NavigationList from './NavigationList'

type Props = {
  setDarkModeIsEnabled: React.Dispatch<React.SetStateAction<Boolean>>,
  is_dark_mode_enabled: Boolean,
}

type State = {
  is_drawer_open: boolean,
}

const AppBarWithDrawer = (props: Props) => {
  const {
    handleDrawer,
    should_display,
    title,
    is_drawer_open,
    setDarkModeIsEnabled,
    is_dark_mode_enabled,
  } = useAppBarWithDrawer(props)

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" open={is_drawer_open}>
        <Toolbar sx={{display: 'flex', width: '100%'}}>
          {should_display.menu_icon &&
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawer}
              edge="start"
              sx={{
                marginRight: 5,
              }}
            >
              <MenuIcon />
            </IconButton>
          }
          <Typography variant="h6" noWrap component="div">
            {title}
          </Typography>
          <DarkModeButton setDarkModeIsEnabled={setDarkModeIsEnabled} is_dark_mode_enabled={is_dark_mode_enabled}/>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={is_drawer_open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <NavigationList is_drawer_open={is_drawer_open} />
        </List>
      </Drawer>
    </Box >
  )
}

export default AppBarWithDrawer


const useAppBarWithDrawer = ({
  setDarkModeIsEnabled,
  is_dark_mode_enabled,
}: Props) => {
  const [{
    is_drawer_open,
  }, setState] = React.useState<State>({
    is_drawer_open: true,
  })

  const handleDrawer = () => {
    setState((x) => ({
      ...x,
      is_drawer_open: !is_drawer_open,
    }))
  }

  const should_display = React.useMemo(() => {
    return {
      menu_icon: is_drawer_open === false,
    }
  }, [is_drawer_open])

  const title = React.useMemo(() => 'The DPS Kiki Meter Official for Git', [])

  return {
    handleDrawer,
    should_display,
    title,
    is_drawer_open,
    setDarkModeIsEnabled,
    is_dark_mode_enabled,
  }
}

const DarkModeButton = ({
  setDarkModeIsEnabled,
  is_dark_mode_enabled,
}: {
  setDarkModeIsEnabled: React.Dispatch<React.SetStateAction<Boolean>>,
  is_dark_mode_enabled: Boolean,
}) => {
const should_display = React.useMemo(() => {
  return {
    night_button: is_dark_mode_enabled === true,
    light_button: is_dark_mode_enabled === false,
  }
}, [is_dark_mode_enabled])

  return (
    <IconButton
      color="inherit"
      aria-label="set dark theme mode"
      onClick={() => setDarkModeIsEnabled(!is_dark_mode_enabled)}
      edge="start"
      sx={{
        marginLeft: 'auto'
      }}
    >
      {should_display.light_button && <LightModeIcon/>}
      {should_display.night_button && <ModeNightIcon />}
    </IconButton>
  )
}
