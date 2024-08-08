import { useEffect, useState } from 'react'

import PortfolioSection from './components/PortfolioSection'
import Recommend from './components/Recommend'
import Footer from '../../components/Footer/Footer'

const Portfolio = () => {
  const token = localStorage.getItem('token')
  const [, setShowHeroSection] = useState(true)
  const [, setLoggedIn] = useState(false)

  useEffect(() => {
    if (token) {
      setLoggedIn(true)
      setShowHeroSection(false)
    } else {
      setLoggedIn(false)
    }
  }, [token])

  return (
    <>
      <PortfolioSection />
      <Recommend />
      <Footer />
    </>
  )
}

export default Portfolio
