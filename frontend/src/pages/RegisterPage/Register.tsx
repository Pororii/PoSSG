import React, { useState } from 'react'

import KeywordInput from './components/KeywordInput'
import { postCheckEmailNumber } from '../../api/user/postCheckEmailNumber'
import { postCheckEmailSend } from '../../api/user/postCheckEmailSend'
import { register } from '../../api/user/postRegister'

const Register = () => {
  const [email, setEmail] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false)
  const [password, setPassword] = useState<string>('')
  const [checkedPassword, setCheckedPassword] = useState<string>('')
  const [nickname, setNickname] = useState<string>('')
  const [university, setUniversity] = useState<string>('')
  const [major, setMajor] = useState<string>('')
  const [secondMajor, setSecondMajor] = useState<string>('')
  const [period, setPeriod] = useState<number>(1)
  const [semesterOff, setSemesterOff] = useState<boolean>(false)
  const [job, setJob] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleEmailVerificationSend = async () => {
    try {
      const response = await postCheckEmailSend(email)
      if (response) {
        alert('인증번호가 이메일로 전송되었습니다.')
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('오류 메시지:', error.message)
      }
    }
  }

  const handleVerifyCode = async () => {
    try {
      const response = await postCheckEmailNumber(email, verificationCode)
      if (response) {
        setIsEmailVerified(true)
        alert('인증번호가 확인되었습니다.')
      }
    } catch (error) {
      console.error(error)
      alert('인증번호 확인에 실패했습니다.')
    }
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    if (!email) newErrors.email = '* 필수 항목입니다.'
    if (!verificationCode || !isEmailVerified)
      newErrors.verificationCode = '* 이메일 인증이 필요합니다.'
    if (!password) newErrors.password = '* 필수 항목입니다.'
    if (!nickname) newErrors.nickname = '* 필수 항목입니다.'
    if (!university) newErrors.university = '* 필수 항목입니다.'
    if (!major) newErrors.major = '* 필수 항목입니다.'
    if (!job) newErrors.job = '* 필수 항목입니다.'
    if (tags.length < 1) newErrors.tags = '* 최소 1개의 태그를 입력해야 합니다.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const payload = {
      email,
      password,
      nickname,
      university,
      major,
      secondMajor,
      period,
      semesterOff,
      job,
      tags,
    }

    console.log('Payload for backend:', payload)

    try {
      const response = await register(
        email,
        password,
        nickname,
        university,
        major,
        secondMajor,
        period,
        semesterOff,
        job,
        tags,
      )
      if (response) {
        alert('회원가입이 성공적으로 완료되었습니다!')
      }
    } catch (error) {
      console.error(error)
      alert('회원가입에 실패했습니다.')
    }
  }
  const convertPeriodToNumber = (selectedPeriod: string): number => {
    const mapping: { [key: string]: number } = {
      '1-1': 1,
      '1-2': 2,
      '2-1': 3,
      '2-2': 4,
      '3-1': 5,
      '3-2': 6,
      '4-1': 7,
      '4-2': 8,
      기타: 9,
    }
    return mapping[selectedPeriod]
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
                      <p className='mb-1 ml-1 text-sm'>이메일</p>
                      <input
                        type='email'
                        name='email'
                        id='email'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        placeholder='이메일을 입력하세요'
                        required
                      />
                      {errors.email && (
                        <p className='text-red-500 text-sm mt-1'>
                          {errors.email}
                        </p>
                      )}
                      <button
                        type='button'
                        className='absolute right-3 top-10 w-15 bg-blue-600 text-white text-xs font-normal rounded-md py-1 px-2 transition duration-200 ease-in-out cursor-pointer'
                        onClick={handleEmailVerificationSend}
                      >
                        인증
                      </button>
                    </div>

                    <div className='mb-4'>
                      <p className='mb-1 ml-1 text-sm'>인증번호</p>
                      <input
                        type='text'
                        value={verificationCode}
                        onChange={e => setVerificationCode(e.target.value)}
                        className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500'
                      />
                      {errors.verificationCode && (
                        <p className='text-red-500 text-sm mt-1'>
                          {errors.verificationCode}
                        </p>
                      )}
                      <button
                        type='button'
                        onClick={handleVerifyCode}
                        className='mt-2 px-4 py-2 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600'
                      >
                        인증번호 확인
                      </button>
                    </div>

                    <div className='relative'>
                      <p className='mb-1 ml-1 text-sm'>닉네임</p>
                      <input
                        type='text'
                        name='nickname'
                        id='nickname'
                        value={nickname}
                        onChange={e => setNickname(e.target.value)}
                        maxLength={10}
                        className={`bg-gray-50 border border-gray-300 text-gray-800 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                        placeholder='닉네임을 입력해주세요'
                        required
                      />
                      {errors.nickname && (
                        <p className='text-red-500 text-sm mt-1'>
                          {errors.nickname}
                        </p>
                      )}
                    </div>
                    <div className='relative'>
                      <p className='mb-1 ml-1 text-sm'>대학교</p>
                      <input
                        type='text'
                        value={university}
                        onChange={e => setUniversity(e.target.value)}
                        className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        placeholder='대학교를 입력하세요'
                      />
                      {errors.university && (
                        <p className='text-red-500 text-sm mt-1'>
                          {errors.university}
                        </p>
                      )}
                    </div>

                    {/* Major Field */}
                    <div className='relative'>
                      <p className='mb-1 ml-1 text-sm'>전공</p>
                      <input
                        type='text'
                        value={major}
                        onChange={e => setMajor(e.target.value)}
                        className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        placeholder='전공을 입력하세요'
                      />
                      {errors.major && (
                        <p className='text-red-500 text-sm mt-1'>
                          {errors.major}
                        </p>
                      )}
                    </div>

                    {/* Second Major Field */}
                    <div className='relative'>
                      <p className='mb-1 ml-1 text-sm'>복수전공</p>
                      <input
                        type='text'
                        value={secondMajor}
                        onChange={e => setSecondMajor(e.target.value)}
                        className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        placeholder='복수 전공을 입력하세요'
                      />
                    </div>

                    {/* Period Field */}
                    <div className='relative'>
                      <p className='mb-1 ml-1 text-sm'>학기</p>
                      <select
                        value={period}
                        onChange={e =>
                          setPeriod(convertPeriodToNumber(e.target.value))
                        }
                        className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                      >
                        <option value='1-1'>1학년 1학기</option>
                        <option value='1-2'>1학년 2학기</option>
                        <option value='2-1'>2학년 1학기</option>
                        <option value='2-2'>2학년 2학기</option>
                        <option value='3-1'>3학년 1학기</option>
                        <option value='3-2'>3학년 2학기</option>
                        <option value='4-1'>4학년 1학기</option>
                        <option value='4-2'>4학년 2학기</option>
                        <option value='기타'>기타</option>
                      </select>
                    </div>

                    {/* Semester Off Field */}
                    <div className='relative'>
                      <p className='mb-1 ml-1 text-sm'>휴학 여부</p>
                      <select
                        value={semesterOff ? 'yes' : 'no'}
                        onChange={e => setSemesterOff(e.target.value === 'yes')}
                        className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                      >
                        <option value='no'>아니요</option>
                        <option value='yes'>예</option>
                      </select>
                    </div>

                    {/* Job Field */}
                    <div className='relative'>
                      <p className='mb-1 ml-1 text-sm'>희망직무</p>
                      <input
                        type='text'
                        value={job}
                        onChange={e => setJob(e.target.value)}
                        className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        placeholder='희망 직무를 입력하세요'
                      />
                      {errors.job && (
                        <p className='text-red-500 text-sm mt-1'>
                          {errors.job}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className='mb-1 ml-1 text-sm'>비밀번호</p>
                      <input
                        type='password'
                        name='password'
                        id='password'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder='8 to 20 digits including English characters, numbers, and special characters'
                        className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        required
                      />
                      <input
                        type='password'
                        name='checkedPassword'
                        id='checkedPassword'
                        placeholder='Confirm Password'
                        value={checkedPassword}
                        onChange={e => setCheckedPassword(e.target.value)}
                        className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        required
                      />
                    </div>

                    <KeywordInput keywords={tags} setKeywords={setTags} />
                    {errors.tags && (
                      <p className='text-red-500 text-sm mt-1'>{errors.tags}</p>
                    )}

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
                      className='w-full flex justify-center rounded-lg bg-blue-600 py-3 px-4 text-lg font-semibold leading-tight text-white shadow-md transition duration-200 ease-in-out cursor-pointer mb-2'
                    >
                      회원가입
                    </button>
                    <p className='mt-10 text-center text-sm text-gray-500'>
                      이미 계정이 있나요?&nbsp;&nbsp;&nbsp;
                      <a
                        href='/login'
                        className='font-semibold text-primary-600 hover:underline dark:text-primary-500'
                      >
                        로그인
                      </a>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
export default Register
