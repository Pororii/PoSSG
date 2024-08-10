import React, { useState, useEffect } from 'react'
import Modal from 'react-modal'
import { useNavigate } from 'react-router-dom'

import { postEditInfo } from '../../api/user/postEditInfo'
import { useUserStore } from '../../stores/useUserStore'
import {
  saveUserToLocalStorage,
  removeUserFromLocalStorage,
} from '../../utils/localStorage'

const MyInfoCard = ({
  isOpen,
  onRequestClose,
}: {
  isOpen: boolean
  onRequestClose: () => void
}) => {
  const { user: userInfo, setUser: setUserInfo } = useUserStore()
  const navigate = useNavigate()

  // State to manage nickname and job
  const [nickname, setNickname] = useState<string>('')
  const [job, setJob] = useState<string>('')

  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [loggedIn, setLoggedIn] = useState<boolean>(
    !!localStorage.getItem('token'),
  )
  const token = localStorage.getItem('token')

  // UseEffect to initialize nickname and job when userInfo is available
  useEffect(() => {
    if (userInfo) {
      setNickname(userInfo.nickname || '')
      setJob(userInfo.job || '')
    }
  }, [userInfo])

  const handleSaveButtonClick = async () => {
    if (token) {
      const editInfoResult = await postEditInfo(token, nickname, job)
      if (editInfoResult?.data) {
        const updatedUserInfo = {
          ...userInfo,
          nickname,
          job,
          email: userInfo?.email || '',
        }
        setUserInfo(updatedUserInfo)
        saveUserToLocalStorage(updatedUserInfo)
        setIsEditing(false)
      }
    }
  }

  const handleLoginButtonClick = () => {
    if (loggedIn) {
      localStorage.removeItem('token')
      removeUserFromLocalStorage()
      setUserInfo(null)
      setLoggedIn(false)
      navigate('/')
    } else {
      navigate('/login')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className='right-4 top-0 mt-20 mr-10 fixed rounded-lg ml-2 mr-2 shadow-inner outline outline-1 outline-neutral-200 z-10'
      overlayClassName='bg-transparent'
    >
      <div className='bg-white rounded-lg shadow-lg p-6 w-[24rem] h-78 flex flex-col justify-between'>
        <div>
          <h2 className='text-lg font-bold text-gray-700 mb-4'>My Info</h2>
        </div>
        <div className='flex items-center flex-grow justify-center'>
          <div className='ml-4 flex flex-col items-start w-16rem'>
            <div className='w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center'>
              <svg
                className='w-20 h-20 text-gray-400'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M12 12c2.28 0 4-1.72 4-4s-1.72-4-4-4-4 1.72-4 4 1.72 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'></path>
              </svg>
            </div>
          </div>
          <div className='ml-8 flex flex-col items-start w-full'>
            {isEditing ? (
              <>
                <input
                  type='text'
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  className='text-xl font-semibold text-black mb-2 border rounded px-2 py-1 w-full'
                />
                <input
                  type='text'
                  value={job}
                  onChange={e => setJob(e.target.value)}
                  className='text-gray-500 mb-4 border rounded px-2 py-1 w-full'
                />
                <button
                  className='bg-blue-500 text-white py-1 rounded hover:bg-blue-600 w-full'
                  onClick={handleSaveButtonClick}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <h2 className='text-xl font-semibold text-black mb-2'>
                  {nickname}
                </h2>
                <p className='text-gray-500 mb-4'>{job}</p>
                <button
                  className='bg-blue-500 text-white px-20 py-1 rounded hover:bg-blue-600 w-full'
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>

        <div className='w-full border-t border-gray-300 mt-8 pb-4'></div>
        <div className='flex justify-center '>
          <button
            className='text-black hover:text-gray-700 pw-10 py-1 w-full'
            onClick={handleLoginButtonClick}
          >
            {loggedIn ? 'Logout' : 'Login'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default MyInfoCard