import React from 'react'
import { 
  Routes, 
  Route,
} from "react-router-dom"

import {
  NavigationAndHeader,
} from '../common'

import {
  Administration,
  Graphs,
} from '../views'

type Props = {
  setDarkModeIsEnabled: React.Dispatch<React.SetStateAction<Boolean>>,
  is_dark_mode_enabled: Boolean,
}

const MainRouter = ({
  setDarkModeIsEnabled,
  is_dark_mode_enabled,
}: Props) => {

  return (
    <NavigationAndHeader setDarkModeIsEnabled={setDarkModeIsEnabled} is_dark_mode_enabled={is_dark_mode_enabled}>
      <Routes>
        <Route path='/' element={<Graphs />} />
        <Route path='/administration' element={<Administration />} />
      </Routes>
    </NavigationAndHeader>
  )
}

export default MainRouter