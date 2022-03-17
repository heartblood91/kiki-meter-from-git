import * as React from 'react'
import Box from '@mui/material/Box'

import AppBarWithDrawer from './AppBarWithDrawer'
import {
  DrawerHeader,
} from './MyDrawer'

type Props = {
  children: React.ReactElement,
  setDarkModeIsEnabled: React.Dispatch<React.SetStateAction<Boolean>>,
  is_dark_mode_enabled: Boolean,
}

const NavigationAndHeader = ({
  children,
  setDarkModeIsEnabled,
  is_dark_mode_enabled,
}: Props) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarWithDrawer setDarkModeIsEnabled={setDarkModeIsEnabled} is_dark_mode_enabled={is_dark_mode_enabled}/>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  )
}


export default NavigationAndHeader
