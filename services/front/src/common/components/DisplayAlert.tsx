import React from "react"
import { 
  Snackbar,
  Alert,
 } from '@mui/material'

type Props = {
  message: string,
  severity: "error" | "success" | "info",
  horizontal?: "left" | "center" | "right",
}

type State = {
  is_visible: boolean,
}

const DisplayAlert = (props: Props) => {
const {
  is_visible,
  onClose,
  horizontal,
  severity,
  message,
} = useDisplayAlert(props)

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal,
      }}
      open={is_visible}
      autoHideDuration={5000}
      onClose={onClose}
    >
      <Alert
        elevation={6}
        variant="filled"
        onClose={onClose}
        severity={severity}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}

export default DisplayAlert

const useDisplayAlert = ({
  horizontal = 'right',
  message,
  severity,
}: Props) => {
  const [{
    is_visible,
  }, setState] = React.useState<State>({
    is_visible: false,
  })

  React.useEffect(() => {
    if (message) {
      setState((x) => ({
        ...x,
        is_visible: true,
      }))
    }

  }, [message])

  const onClose = (
    event?: Event | React.SyntheticEvent<any, Event>,
    reason?: string
  ): void => {
    if (reason !== "clickaway") {
      setState((x) => ({
        ...x,
        is_visible: false,
      }))
    }
  }

  return {
    is_visible,
    onClose,
    horizontal,
    severity,
    message,
  }
}
