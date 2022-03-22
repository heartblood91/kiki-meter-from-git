import React from 'react'

import NavigationItem from './NavigationItem'
import AutoGraphIcon from '@mui/icons-material/AutoGraph'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'

import { useNavigate } from "react-router-dom";

type Props = {
  is_drawer_open: Boolean,
}

const NavigationList = (props: Props) => {
  const {
    is_drawer_open,
    onClick,
  } = useNavigationList(props)

  return (
    <React.Fragment>
      <NavigationItem
        text='Graphiques'
        is_drawer_open={is_drawer_open}
        icon={<AutoGraphIcon />}
        onClick={onClick('/')}
      />
      <NavigationItem
        text='Administration'
        is_drawer_open={is_drawer_open}
        icon={<AdminPanelSettingsIcon />}
        onClick={onClick('/administration')}
      />
    </React.Fragment>
  )
}

export default NavigationList

const useNavigationList = ({
  is_drawer_open,
}: Props) => {
  const navigate = useNavigate()

  const match = (pathname: string) => {
    const current_pathname = window.location.pathname

    return pathname === current_pathname
  }

  const onClick = React.useCallback((next_url: string) => () => {
    if (!match(next_url)) {
      navigate(next_url)
    }
  }, [navigate])

  return {
    is_drawer_open,
    onClick,
  }
}
