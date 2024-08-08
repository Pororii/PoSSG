import { Button, Navbar } from 'flowbite-react'
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { user } from '../../api/user/getUser'
//import { postEditInfo } from '../../api/user/postEditInfo'
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
  const [showProfilePopup, setShowProfilePopup] = useState<boolean>(false)
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
    <div>
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
              <div
                className='list-none font-semibold cursor-pointer'
                role='button' // 추가된 부분
                tabIndex={0} // 추가된 부분
                onClick={() => setShowProfilePopup(true)}
                onKeyDown={e => {
                  // 추가된 부분
                  if (e.key === 'Enter' || e.key === ' ') {
                    setShowProfilePopup(true)
                  }
                }}
              >
                {userInfo?.nickname}
              </div>
              &nbsp;
              <span className='list-none font-semibold cursor-pointer'>님</span>
              &nbsp;&nbsp;
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
      {showProfilePopup && (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
          <div className='bg-white rounded-lg shadow-lg pl-6 pt-6 pr-6 w-[24rem] h-78 flex flex-col justify-between'>
            <div>
              <h2 className='text-lg font-bold text-gray-700 mb-4'>My Info</h2>
            </div>
            <div className='flex items-center flex-grow justify-center'>
              <div className='w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center'>
                <svg
                  className='w-20 h-20 text-gray-400'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12 12c2.28 0 4-1.72 4-4s-1.72-4-4-4-4 1.72-4 4 1.72 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'></path>
                </svg>
              </div>
              <div className='ml-8 flex flex-col items-'>
                <h2 className='text-xl font-semibold text-black mb-2'>
                  Nickname
                </h2>
                <p className='text-gray-500 mb-4'>Frontend Developer</p>
                <button
                  className='bg-blue-500 text-white px-20 py-1 rounded hover:bg-blue-600'
                  onClick={() => {
                    setShowProfilePopup(false)
                    // 추가 동작을 여기에 작성
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
            <div className='w-full border-t border-gray-300 mt-6'></div>
            <div className='flex justify-center '>
              <button
                className='text-black hover:text-gray-700 pw-10 py-5 w-full'
                onClick={() => setShowProfilePopup(false)}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbars
