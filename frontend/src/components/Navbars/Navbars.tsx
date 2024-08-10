import { Icon } from '@iconify/react'
import arrowDropDownLine from '@iconify-icons/ri/arrow-drop-down-line'
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
import MyInfoCard from '../MyInfo/MyInfoCard'

const theme = {
  active: {
    on: 'text-black tracking-tighter font-semibold dark:text-white md:bg-transparent md:text-black',
    off: 'border-b border-gray-100 text-gray-500 tracking-tighter font-semibold dark:border-gray-700 dark:text-gray-400 md:border-0 md:hover:bg-transparent dark:hover:text-white md:hover:text-black md:dark:hover:text-white',
  },
}

const Navbars: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeLink, setActiveLink] = useState<string>('')
  const [loggedIn, setLoggedIn] = useState<boolean>(false)
  const { user: userInfo, setUser: setUserInfo } = useUserStore()
  const [isMyInfoCardOpen, setIsMyInfoCardOpen] = useState(false)

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
          {loggedIn ? (
            <div className='flex items-center justify-end mr-4'>
              {' '}
              {/* 전체 컨테이너를 오른쪽으로 정렬하고, 오른쪽 마진 추가 */}
              <div
                className='flex items-center space-x-3 cursor-pointer'
                role='button'
                tabIndex={0}
                onClick={() => setIsMyInfoCardOpen(true)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setIsMyInfoCardOpen(true)
                  }
                }}
              >
                {' '}
                {/* 사진, 이름, 아이콘을 묶는 컨테이너 */}
                <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>
                  <svg
                    className='w-20 h-20 text-gray-400'
                    fill='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path d='M12 12c2.28 0 4-1.72 4-4s-1.72-4-4-4-4 1.72-4 4 1.72 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'></path>
                  </svg>
                </div>
                <div className='font-semibold'>{userInfo?.nickname}</div>
                <Icon
                  icon={arrowDropDownLine}
                  style={{ color: 'black', fontSize: '24px' }}
                />
              </div>
            </div>
          ) : (
            <Navbar.Link
              theme={theme}
              href='/login'
              className={getButtonStyle('/login')}
            >
              <Button
                color='light'
                className={`font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 md:dark:hover:bg-transparent ${
                  activeLink === 'login' ? 'active' : ''
                }`}
                onClick={handleLoginButtonClick}
              >
                Login
              </Button>
            </Navbar.Link>
          )}
        </div>
      </Navbar>
      <MyInfoCard
        isOpen={isMyInfoCardOpen}
        onRequestClose={() => setIsMyInfoCardOpen(false)}
      />
    </div>
  )
}

export default Navbars
