import React from 'react'
import {
  CardContent,
  Typography,
  Card,
  CardActions,
} from '@mui/material'

import { Flex, DisplayAlert } from '../common'

import CalculateIcon from '@mui/icons-material/Calculate'
import LoadingButton from '@mui/lab/LoadingButton'

type State = {
  loading: boolean,
  error_message: string,
}

const Administration = () => {
  const [{
    loading,
    error_message,
  }, setState] = React.useState<State>({
    loading: false,
    error_message: '',
  })

  const onClick = React.useCallback(async () => {
    setState((x) => ({
      ...x,
      loading: true,
    }))

    try {
      await fetch('http://api.localhost/update/database', {
        method: 'GET',
      })

      setState((x) => ({
        ...x,
        loading: false,
      }))
    } catch (e) {
      const error = e as Error
      setState((x) => ({
        ...x,
        loading: false,
        error_message: error.message,
      }))
    }
  }, [
    setState,
  ])

  const disabled = React.useMemo(() => error_message !== '', [error_message])

  return (
    <Flex.Container>
      <Flex.Item xs={4}>
        <Card>
          <Flex.Container>
            <Flex.Item xs={12}>
              <CardContent>
                <Typography variant='h6'>
                  Base de donnée
                </Typography>
                <Typography variant='body1' sx={{ textAlign: 'justify' }}>
                  Si vous souhaitez mettre à jour la base de donnée appuyer sur le bouton ci-dessous.<br />
                  Cela aura pour effet de compter, pour chaque commit, le nombre de ligne par développeur.
                </Typography>
              </CardContent>
            </Flex.Item>
            <Flex.Item xs={12}>
              <CardActions sx={{ justifyContent: 'center' }}>
                <LoadingButton
                  variant='contained'
                  endIcon={<CalculateIcon />}
                  onClick={onClick}
                  loading={loading}
                  loadingPosition='end'
                  disabled={disabled}
                >
                  Calculer
                </LoadingButton>
              </CardActions>
            </Flex.Item>
          </Flex.Container>
        </Card>
      </Flex.Item>
      <Flex.Item xs={12}>
        <DisplayAlert
          message={error_message}
          severity='error'
        />
      </Flex.Item>
    </Flex.Container>
  )
}

export default Administration
