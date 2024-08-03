import { Button, Modal } from 'flowbite-react'
import React, { useState, useEffect } from 'react'
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'

import { checkEmail } from '../../api/user/postCheckEmail'
import { register } from '../../api/user/postRegister'

const Register = () => {
  const [openModal, setOpenModal] = useState(false)
  const [openFailModal, setOpenFailModal] = useState(false)
  const [signupForm, setSignupForm] = useState({
    email: '',
    nickname: '',
    job: '',
    password: '',
    checkedPassword: '',
  })

  // 오류 메세지
  const [validMessage, setValidMessage] = useState({
    emailMessage: '',
    nicknameMessage: '',
    passwordMessage: '',
    checkedPasswordMessage: '',
  })

  // 유효성 검사
  const [isValid, setIsValid] = useState({
    email: false,
    nickname: false,
    password: false,
    checkedPassword: false,
  })

  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSignupForm({ ...signupForm, [name]: value })
  }

  const handleCheckEmail = async () => {
    const emailResult = await checkEmail(signupForm.email)

    if (emailResult?.data.isExist === true) {
      // 이메일 중복
      setValidMessage(prev => ({
        ...prev,
        emailMessage: 'The email is unavailable.',
      }))
      setIsValid({ ...isValid, checkedPassword: false })
    } else if (emailResult?.data.isExist == false) {
      // 이메일 사용 가능
      setValidMessage(prev => ({
        ...prev,
        emailMessage: 'The email is available.',
      }))
      setIsValid({ ...isValid, checkedPassword: true })
    } else {
      // 기타 상황
      setValidMessage(prev => ({
        ...prev,
        emailMessage: 'Please try again in a moment.',
      }))
      setIsValid({ ...isValid, checkedPassword: false })
    }
  }

  // 닉네임 유효성 검사
  useEffect(() => {
    const regex = /^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,10}$/

    if (!regex.test(signupForm.nickname)) {
      setValidMessage(prev => ({
        ...prev,
        nicknameMessage: 'Please enter 2 or more and 10 or less characters.',
      }))
      setIsValid({ ...isValid, nickname: false })
    } else {
      setValidMessage(prev => ({
        ...prev,
        nicknameMessage: 'The nickname is available.',
      }))
      setIsValid({ ...isValid, nickname: true })
    }
  }, [signupForm.nickname])

  // 비밀번호 유효성 검사
  useEffect(() => {
    const regex = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*]).{8,15}$/

    if (!regex.test(signupForm.password)) {
      setValidMessage(prev => ({
        ...prev,
        passwordMessage:
          'Please enter at least 8 characters, including numbers, letters, and special characters.',
      }))
      setIsValid({ ...isValid, password: false })
    } else {
      setValidMessage(prev => ({
        ...prev,
        passwordMessage: '',
      }))
      setIsValid({ ...isValid, password: true })
    }
  }, [signupForm.password])

  // 비밀번호 확인
  useEffect(() => {
    if (signupForm.password !== signupForm.checkedPassword) {
      setValidMessage(prev => ({
        ...prev,
        checkedPasswordMessage: 'The passwords do not match.',
      }))
      setIsValid({ ...isValid, checkedPassword: false })
    } else {
      setValidMessage(prev => ({
        ...prev,
        checkedPasswordMessage: '',
      }))
      setIsValid({ ...isValid, checkedPassword: true })
    }
  }, [signupForm.password, signupForm.checkedPassword])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isValid) {
      const registerResult = await register(
        signupForm.email,
        signupForm.password,
        signupForm.nickname,
        signupForm.job,
      )

      if (registerResult) {
        setOpenModal(true)
      } else {
        setOpenFailModal(false)
        console.error('register fail')
      }
    } else {
      setOpenFailModal(false)
      console.error('register fail')
      return
    }
  }

  const handleSuccessPopUp = () => {
    setOpenModal(false)
    if (!openFailModal) navigate('/login')
  }

  return (
    <>
      <div className='bg-blue-600 w-screen min-h-screen'>
        <section className='dark:bg-gray-900'>
          <div className='flex justify-between pt-10 px-20'>
            <div className='text-white text-3xl leading-snug flex flex-col justify-center min-h-screen'>
              <div className='px-10'>
                <p className='font-semibold text-3xl leading-tight'>
                  Don&apos;t worry,<br></br>Portfolio is simple.
                </p>
                <br></br>
                <p className='font-semibold text-2xl'>
                  <span className='text-3xl font-semibold'>With POSSG,</span>
                  <br></br>make your own amazing portfolio.
                </p>
              </div>
              <img
                className='w-80 pl-10 pt-10 mt-20'
                src={`/img/charactor.png`}
                alt='possg-charactor'
              />
            </div>

            <div className='flex flex-col items-end justify-center px-6 py-8 mt-10'>
              <div className='w-full bg-white rounded-lg md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700'>
                <div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
                  <form
                    className='space-y-4 md:space-y-5'
                    onSubmit={handleSubmit}
                  >
                    <div className='relative'>
                      <p className='mb-1 ml-1 text-sm'>Email</p>
                      <input
                        type='email'
                        name='email'
                        id='email'
                        value={signupForm.email}
                        onChange={handleChange}
                        className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        placeholder='Type your email'
                        required
                      />
                      <button
                        type='button'
                        className='absolute right-3 top-10 w-15 bg-blue-600 text-white text-xs font-normal rounded-md py-1 px-2 transition duration-200 ease-in-out cursor-pointer'
                        onClick={handleCheckEmail}
                      >
                        Check
                      </button>
                      <p className={`text-gray-500 sm:text-sm ml-2 mt-1`}>
                        {validMessage.emailMessage}
                      </p>
                    </div>
                    <div className='relative'>
                      <p className='mb-1 ml-1 text-sm'>Nickname</p>
                      <input
                        type='text'
                        name='nickname'
                        id='nickname'
                        value={signupForm.nickname}
                        onChange={handleChange}
                        maxLength={10}
                        className={`bg-gray-50 border border-gray-300 text-gray-800 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                        placeholder='Type your nickname'
                        required
                      />
                      <p className={`text-gray-500 sm:text-sm ml-2 mt-1`}>
                        {validMessage.nicknameMessage}
                      </p>
                    </div>
                    <div className='relative'>
                      <p className='mb-1 ml-1 text-sm'>Preferred job</p>
                      <input
                        type='text'
                        name='job'
                        id='job'
                        value={signupForm.job}
                        onChange={handleChange}
                        maxLength={20}
                        className={`bg-gray-50 border border-gray-300 text-gray-800 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                        placeholder='Please enter your preferred job if you have one'
                      />
                    </div>
                    <div>
                      <p className='mb-1 ml-1 text-sm'>Password</p>
                      <input
                        type='password'
                        name='password'
                        id='password'
                        value={signupForm.password}
                        onChange={handleChange}
                        placeholder='8 to 20 digits including English characters, numbers, and special characters'
                        className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        required
                      />
                      <p className='text-red-500 sm:text-sm ml-2 mt-1 mb-2'>
                        {validMessage.passwordMessage}
                      </p>
                      <input
                        type='password'
                        name='checkedPassword'
                        id='checkedPassword'
                        placeholder='Confirm Password'
                        value={signupForm.checkedPassword}
                        onChange={handleChange}
                        className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        required
                      />
                      <p className='text-red-500 sm:text-sm ml-2 mt-1'>
                        {validMessage.checkedPasswordMessage}
                      </p>
                    </div>
                    <br />
                    <div className='flex items-start'>
                      <div className='flex items-center h-5'>
                        <input
                          id='terms'
                          aria-describedby='terms'
                          type='checkbox'
                          className='w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800'
                          required
                        />
                      </div>
                      <div className='ml-3 text-sm'>
                        <label
                          htmlFor='terms'
                          className='font-light text-gray-500 dark:text-gray-300'
                        >
                          Accept{' '}
                          <a
                            className='font-medium text-primary-600 hover:underline dark:text-primary-500'
                            href='/'
                          >
                            Terms & Conditions
                          </a>
                        </label>
                      </div>
                    </div>
                    <button
                      type='submit'
                      onClick={() => setOpenModal(true)}
                      className='w-full flex justify-center rounded-lg bg-blue-600 py-3 px-4 text-lg font-semibold leading-tight text-white shadow-md transition duration-200 ease-in-out cursor-pointer mb-2'
                    >
                      Sign Up
                    </button>
                    <p className='mt-10 text-center text-sm text-gray-500'>
                      Already have an account?&nbsp;&nbsp;&nbsp;
                      <a
                        href='/login'
                        className='font-semibold text-primary-600 hover:underline dark:text-primary-500'
                      >
                        Log in
                      </a>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Modal
        show={openModal}
        size='md'
        onClose={() => setOpenModal(false)}
        popup
      >
        <div className='fixed top-20 left-0 w-full h-full bg-gray-500 bg-opacity-60'></div>
        <div className='flex items-center justify-center fixed inset-0 opacity-100'>
          <div className='z-10 bg-white rounded-lg border-solid border-black-500 p-70 flex flex-col justify-center items-center'>
            <Modal.Body>
              <div className='text-center px-10'>
                <HiOutlineExclamationCircle className='mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-black-200' />
                <h3 className='mb-5 text-lg font-normal text-gray-500 dark:text-gray-400 shadow-3xl'>
                  {openFailModal
                    ? 'Failed to sign up for membership'
                    : 'Welcome to being a member of PoSSG!'}
                </h3>
                <div className='flex justify-center gap-4'>
                  <Button
                    className='bg-gray-100 text-black w-20 hover:bg-blue-600 hover:text-white'
                    onClick={handleSuccessPopUp}
                  >
                    Check
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </div>
        </div>
      </Modal>
    </>
  )
}
export default Register
