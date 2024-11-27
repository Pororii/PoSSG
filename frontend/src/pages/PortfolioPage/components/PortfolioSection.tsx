import { Button } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'

import { makePortfolio } from '../../../api/portfolio/getMakePortfolio'
import { getPortfolio } from '../../../api/portfolio/getPortfolio'
import { editPortfolio } from '../../../api/portfolio/postEditPortfolio'
import Loading from '../../../components/Loading/Loading'
import { GroupedPortfolio } from '../../../interfaces/Interfaces'
import { usePortfolioStore } from '../../../stores/usePortfolioStore'

const PortfolioSection = () => {
  const token = localStorage.getItem('token')
  const { portfolio, setPortfolio } = usePortfolioStore()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [groupedPortfolio, setGroupedPortfolio] = useState<GroupedPortfolio>({})
  const queryClient = useQueryClient()

  const makePortfolioButton = async () => {
    setIsLoading(true)
    if (token) {
      const successResponse = await makePortfolio(token)
      console.log('포트폴리오 요청 성공')
      if (successResponse && successResponse.data) {
        setPortfolio(successResponse.data)
        console.log('Response Data:', successResponse.data)
        setIsLoading(false)
      }
    }
  }

  const fetchFile = async () => {
    if (token) {
      const successResponse = await getPortfolio(token)
      if (successResponse) {
        setPortfolio(successResponse)
        console.log('Response Data:', successResponse)
      }
    }
  }

  useEffect(() => {
    fetchFile()
  }, [token])

  useEffect(() => {
    console.log('Updated Portfolio:', portfolio)
  }, [portfolio])

  useEffect(() => {
    if (portfolio && portfolio.length > 0) {
      const groupBySector = portfolio.reduce<GroupedPortfolio>((acc, item) => {
        if (!acc[item.sector]) {
          acc[item.sector] = []
        }
        acc[item.sector].push(item)
        return acc
      }, {})

      setGroupedPortfolio(groupBySector)
    }
  }, [portfolio])

  const handleChange = (
    id: number,
    field: string,
    value: string,
    folderName: string,
  ) => {
    const updatedPortfolio = portfolio.map(item =>
      item.id === id && item.folderName === folderName
        ? { ...item, [field]: value }
        : item,
    )
    setPortfolio(updatedPortfolio)
  }

  const editMutation = useMutation(() => editPortfolio(token!, portfolio), {
    onSuccess: () => {
      queryClient.invalidateQueries('portfolio')
    },
  })

  const handleSave = () => {
    editMutation.mutate()
  }

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {portfolio.length ? (
            <div className='bg-gray-100 flex w-full justify-center text-gray-700 pt-20 mt-10'>
              <div className='flex flex-1 flex-col md:flex-row max-w-7xl items-center justify-start px-5 md:px-20 xl:px-10 py-10'>
                <div className='flex-1 mx-4 text-gray-700'>
                  <div className='text-start mx-auto md:w-[84%] pl-5'>
                    <div className='bg-white border border-gray-200 rounded-lg p-10 shadow-lg overflow-hidden'>
                      {Object.entries(groupedPortfolio).map(
                        ([sector, items]) => (
                          <div key={sector}>
                            <h2 className='text-xl font-bold pb-1 pt-3 mb-4 ml-3 text-blue-600'>
                              {sector}
                            </h2>
                            {items.map(item => (
                              <div key={item.id}>
                                <div>
                                  <input
                                    type='text'
                                    id={`subject-${item.id}`}
                                    value={item.subject}
                                    onChange={e =>
                                      handleChange(
                                        item.id,
                                        'subject',
                                        e.target.value,
                                        item.folderName,
                                      )
                                    }
                                    className='w-full mb-2 border-none font-semibold text-lg whitespace-pre-wrap'
                                  />
                                </div>
                                <div>
                                  <label
                                    htmlFor={`content-${item.id}`}
                                    className='font-semibold ml-3'
                                  >
                                    Content :
                                  </label>
                                  <textarea
                                    id={`content-${item.id}`}
                                    value={item.content}
                                    onChange={e =>
                                      handleChange(
                                        item.id,
                                        'content',
                                        e.target.value,
                                        item.folderName,
                                      )
                                    }
                                    className='w-full mb-2 border-none whitespace-pre-wrap text-justify'
                                    rows={5}
                                  />
                                </div>
                                <div>
                                  <label
                                    htmlFor={`results-${item.id}`}
                                    className='font-semibold ml-3'
                                  >
                                    Results :
                                  </label>
                                  <textarea
                                    id={`results-${item.id}`}
                                    value={item.results}
                                    onChange={e =>
                                      handleChange(
                                        item.id,
                                        'results',
                                        e.target.value,
                                        item.folderName,
                                      )
                                    }
                                    className='w-full mb-2 border-none whitespace-pre-wrap text-justify'
                                    rows={5}
                                  />
                                </div>
                                <div>
                                  <label
                                    htmlFor={`overall-${item.id}`}
                                    className='font-semibold ml-3'
                                  >
                                    Overall :
                                  </label>
                                  <textarea
                                    id={`overall-${item.id}`}
                                    value={item.overall}
                                    onChange={e =>
                                      handleChange(
                                        item.id,
                                        'overall',
                                        e.target.value,
                                        item.folderName,
                                      )
                                    }
                                    className='w-full mb-2 border-none whitespace-pre-wrap text-justify'
                                    rows={5}
                                  />
                                </div>
                                <p className='border-b-2 pb-5 mb-5'></p>
                              </div>
                            ))}
                          </div>
                        ),
                      )}
                      <div className='flex flex-1 justify-end'>
                        <Button
                          onClick={handleSave}
                          className='mt-4 mr-1 bg-blue-600 hover:bg-blue-700'
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='bg-gray-100 flex w-screen justify-center self-stretch text-gray-700'>
              <div className='flex flex-1 flex-col md:flex-row box-border max-w-screen-xl items-center justify-start px-5 md:px-20 xl:px-10 pt-20 pb-1'>
                <div className='flex-1 flex-grow-4 self-start max-w-none prose-lg mx-4 text-gray-700'>
                  <div className='text-center mx-auto md:w-[80%]'>
                    <div className='bg-gray-50 border border-gray-200 text-xs font-normal rounded-md mt-10 px-3 py-5 mx-3 text-center'>
                      <div className='flex justify-center items-center'>
                        <img
                          alt='Character'
                          className='w-44 pt-20'
                          src='/img/charactor.png'
                        />
                      </div>
                      <p className='font-semibold text-lg'>
                        There is no portfolio!
                      </p>
                      <br></br>
                      <br></br>
                      <div className='flex justify-center items-center pb-20'>
                        <Button
                          className='tracking-tighter border-none font-bold px-3 bg-blue-600 hover:bg-blue-700'
                          onClick={makePortfolioButton}
                        >
                          <p className='text-base'>
                            Create your own portfolio in just 3 seconds
                          </p>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default PortfolioSection
