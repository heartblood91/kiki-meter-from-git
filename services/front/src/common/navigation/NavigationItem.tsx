import React from 'react'

import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SxProps,
  Theme,
} from '@mui/material'


type Props = {
  text: string,
  icon: React.ReactElement,
  is_drawer_open: Boolean,
  onClick: () => void,
}

const NavigationItem = (props: Props) => {

  const {
    text,
    icon,
    list_item_button_style,
    list_item_icon_style,
    list_item_text_style,
    onClick,
  } = useNavigationItem(props)

  return (
    <ListItemButton
      onClick={onClick}
      sx={list_item_button_style}
    >
      <ListItemIcon
        sx={list_item_icon_style}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={text}
        sx={list_item_text_style}
      />
    </ListItemButton>
  )
}

export default NavigationItem

const useNavigationItem = ({
  text,
  icon,
  is_drawer_open,
  onClick,
}: Props) => {
  const {
    list_item_button_style,
    list_item_icon_style,
    list_item_text_style,
  } = React.useMemo(() => getListItemStyles({is_drawer_open}), [is_drawer_open])


  return {
    text,
    icon,
    list_item_button_style,
    list_item_icon_style,
    list_item_text_style,
    onClick,
  }
}


const getListItemStyles = ({
  is_drawer_open,
}: {
  is_drawer_open: Boolean,
}) => {
  const getListItemButtonStyle = (): SxProps<Theme> => {
    const default_value = {
      minHeight: 48,
      px: 2.5,
    }
    
    if (is_drawer_open) {
      return {
        ...default_value,
        justifyContent: 'initial', 
      }
    } else {
      return {
        ...default_value,
        justifyContent: 'center',
      }
    }
  }

  const getListItemIconStyle = (): SxProps<Theme> => {
    const default_value = {
      minWidth: 0,
      justifyContent: 'center',
    }
    
    if (is_drawer_open) {
      return {
        ...default_value,
        mr: 3,
      }
    } else {
      return {
        ...default_value,
        mr: 'auto',
      }
    }
  }

  const getListItemTextStyle = (): SxProps<Theme> => {
    if (is_drawer_open) {
      return {
        opacity: 1,
      }
    } else {
      return {
        opacity: 0,
      }
    }
  }

  return {
    list_item_button_style: getListItemButtonStyle(),
    list_item_icon_style: getListItemIconStyle(),
    list_item_text_style: getListItemTextStyle(),
  }
}
