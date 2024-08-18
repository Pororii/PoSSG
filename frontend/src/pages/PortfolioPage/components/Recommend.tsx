import { Button } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { FaSpinner } from 'react-icons/fa'

// import { getAskRecommend } from '../../../api/portfolio/getAskRecommend'
import { getRecommend } from '../../../api/portfolio/getRecommend'

const Recommend = () => {
  const token = localStorage.getItem('token')
  const [recommend, setRecommend] = useState<string[]>()
  // const [isRecommendLoading, setIsRecommendLoading] = useState<boolean>(false) // 직무 추천 로딩 상태 추가

  const fetchRecommend = async () => {
    if (token) {
      const successResponse = await getRecommend(token)
      if (successResponse && successResponse.data) {
        setRecommend(successResponse.data.message.split('직무:').slice(1))
        console.log(successResponse.data.message)
      }
    }
  }

  // const askRecommend = async () => {
  //   setIsRecommendLoading(true)
  //   if (token) {
  //     const successResponse = await getAskRecommend(token)
  //     if (successResponse && successResponse.data) {
  //       setRecommend(successResponse.data.message.split('직무:').slice(1))
  //       console.log(successResponse.data.message)
  //       setIsRecommendLoading(false)
  //     }
  //   }
  // }

  useEffect(() => {
    fetchRecommend()
  }, [token])

  return (
    <>
      {recommend?.length ? (
        <div className='flex w-screen justify-center self-stretch pb-20 pt-5 bg-gray-100 '>
          <div className='flex flex-1 flex-col md:flex-row box-border max-w-screen-xl items-center justify-start px-5 md:px-20 xl:px-10 pt-10 pb-20'>
            <div className='mt-4 pl-10 pr-10 pt-10 pb-10 bg-blue-100 shadow-lg rounded-2xl text-left text-lg mx-auto md:w-[80%]'>
              {recommend.map((job, index) => (
                <div key={index}>
                  <strong>
                    The recommended job role is{' '}
                    <span className='mx-2 text-blue-600 text-xl'>
                      {job.split('이유:')[0]}
                    </span>
                  </strong>
                  <p className='mt-3 mb-4 text-justify'>
                    {job.split('이유:')[1]}
                  </p>
                  {index < recommend.length - 1 && <hr />}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className='flex w-screen justify-center self-stretch text-gray-700 bg-gray-100 '>
          <div className='flex flex-1 flex-col md:flex-row box-border max-w-screen-xl items-center justify-start px-5 md:px-20 xl:px-10 pt-10 pb-20'>
            <div className='flex-1 flex-grow-4 self-start max-w-none prose-lg mx-4 text-gray-700'>
              <div className='text-center mx-auto md:w-[80%]'>
                <div className='bg-gray-50 border border-gray-200 text-xs font-PretendardVariable font-normal rounded-md mt-10 px-3 py-5 mx-3 text-center'>
                  <div className='flex justify-center items-center'>
                    <img
                      alt='logo'
                      className='w-36 pt-20 pb-10'
                      src='/img/logo_black.png'
                    />
                  </div>
                  <p className='font-semibold text-lg'>
                    PoSSG recommends job roles based on your portfolio!
                  </p>
                  <br />
                  <br />
                  <div className='flex justify-center items-center pb-20'>
                    {/* {isRecommendLoading ? ( */}
                    <Button className='tracking-tighter border-none font-bold px-3 bg-blue-600 hover:bg-blue-700'>
                      <FaSpinner className='animate-spin w-8 h-8 text-white py-2 mr-1' />
                      <p className='text-base py-2'>Please wait a moment!</p>
                    </Button>
                    {/* ) : (
                      <Button
                        className='tracking-tighter border-none font-bold px-3 bg-blue-600 hover:bg-blue-700'
                        onClick={askRecommend}
                      >
                        <p className='text-base py-2'>
                          Getting Job Recommendations
                        </p>
                      </Button>
                    )} */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Recommend
