import React from 'react'
import { Outlet } from 'react-router-dom'

import Navbars from './components/NotFoundPage/Navbars/Navbars'

const App = () => {
  return (
    <>
      <Navbars />
      <Outlet />
    </>
  )
}

export default App
