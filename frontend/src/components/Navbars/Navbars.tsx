import { Button, Navbar } from 'flowbite-react'
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { user } from '../../api/user/getUser'
import { useUserStore } from '../../stores/useUserStore'
import {
  getUserFromLocalStorage,
  saveUserToLocalStorage,
  removeUserFromLocalStorage,
} from '../../utils/localStorage'

const theme = {
  active: {
    on: 'text-black tracking-tighter font-semibold dark:text-white md:bg-transparent md:text-black',
    off: 'border-b border-gray-100 text-gray-500 tracking-tighter font-semibold dark:border-gray-700 dark:text-gray-400 md:border-0 md:hover:bg-transparent dark:hover:text-white md:hover:text-black md:dark:hover:text-white',
  },
}

const Navbars = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeLink, setActiveLink] = useState<string>('')
  const [loggedIn, setLoggedIn] = useState<boolean>(false)
  const { user: userInfo, setUser: setUserInfo } = useUserStore()

  const token = localStorage.getItem('token')

  const handleLoginButtonClick = () => {
    if (loggedIn) {
      localStorage.removeItem('token')
      removeUserFromLocalStorage()
      setUserInfo(null)
      setLoggedIn(false)
    } else {
      navigate('/login')
    }
  }

  const getUserNickname = async () => {
    if (token && !userInfo) {
      const userInfoResult = await user(token)
      if (userInfoResult?.data) {
        setUserInfo(userInfoResult.data)
        saveUserToLocalStorage(userInfoResult.data)
      }
    }
  }

  useEffect(() => {
    setActiveLink(location.pathname)
    const storedUser = getUserFromLocalStorage()
    if (token) {
      setLoggedIn(true)
      if (storedUser) {
        setUserInfo(storedUser)
      } else {
        getUserNickname()
      }
    } else {
      setLoggedIn(false)
    }
  }, [location.pathname, token])

  const getButtonStyle = (path: string) => {
    return path === activeLink ? theme.active.on : theme.active.off
  }

  return (
    <Navbar border fluid className='fixed left-0 right-0 top-0 z-50 py-3'>
      <Navbar.Brand href='/'>
        <img
          alt='Logo'
          className='ml-20 mr-2 h-6 sm:h-9'
          src='/img/logo_black.png'
        />
        <span className='self-center whitespace-nowrap text-xl dark:text-white'>
          PoSSG
        </span>
      </Navbar.Brand>
      <div className='flex items-center mr-auto gap-x-4 ml-12 list-none'>
        <Navbar.Link theme={theme} href='/' className={getButtonStyle('/')}>
          Project
        </Navbar.Link>
        <Navbar.Link
          theme={theme}
          href='/portfolio'
          className={getButtonStyle('/portfolio')}
        >
          Portfolio
        </Navbar.Link>
      </div>
      <div className='flex items-center ml-auto gap-x-4 mr-10 list-none'>
        {loggedIn && (
          <div className='flex items-center list-none'>
            <div className='flex w-full font-bold'>{userInfo?.nickname}</div>
            &nbsp;
            <span className='list-none font-semibold'>님</span>&nbsp;&nbsp;
          </div>
        )}
        <Navbar.Link
          theme={theme}
          href='/login'
          className={getButtonStyle('/login')}
        >
          <Button
            color='light'
            className={`font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 md:dark:hover:bg-transparent ${activeLink === 'login' ? 'active' : ''}`}
            onClick={handleLoginButtonClick}
          >
            {loggedIn ? 'Logout' : 'Login'}
          </Button>
        </Navbar.Link>
      </div>
    </Navbar>
  )
}

export default Navbars
