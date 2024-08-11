import { Button } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'

import { makePortfolio } from '../../../api/portfolio/getMakePortfolio'
import { getPortfolio } from '../../../api/portfolio/getPortfolio'
import { getPortfolioFile } from '../../../api/portfolio/getPortfolioFile'
import { editPortfolio } from '../../../api/portfolio/postEditPortfolio'
import Loading from '../../../components/Loading/Loading'
import { GroupedPortfolio } from '../../../interfaces/Interfaces'
import { usePortfolioStore } from '../../../stores/usePortfolioStore'

const PortfolioSection = () => {
  const token = localStorage.getItem('token')
  const { portfolio, setPortfolio, updatePortfolioItem } = usePortfolioStore()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [groupedPortfolio, setGroupedPortfolio] = useState<GroupedPortfolio>({
    // Activity: [
    //   {
    //     id: 1,
    //     sector: 'Activity',
    //     folderName: '봉사활동',
    //     subject: '해외 봉사 활동',
    //     content: '해외에서 봉사 활동을 통해 다양한 경험을 쌓았습니다.',
    //     results: '봉사활동 인증서 획득, 리더십 향상',
    //     overall:
    //       '봉사활동을 통해 다양한 문화를 이해하고, 리더십을 발휘할 수 있었습니다.',
    //   },
    //   {
    //     id: 2,
    //     sector: 'Activity',
    //     folderName: '공모전',
    //     subject: '기술 공모전 참가',
    //     content: '기술 공모전에 참가하여 팀 프로젝트를 수행했습니다.',
    //     results: '3등 수상, 협업 능력 향상',
    //     overall: '공모전을 통해 팀워크와 기술 역량을 높일 수 있었습니다.',
    //   },
    // ],
    // Club: [
    //   {
    //     id: 3,
    //     sector: 'Club',
    //     folderName: '동아리 활동',
    //     subject: '컴퓨터 동아리 활동',
    //     content: '교내 컴퓨터 동아리에서 다양한 프로젝트를 진행했습니다.',
    //     results: '프로젝트 발표, 개발 능력 향상',
    //     overall:
    //       '동아리 활동을 통해 실무 능력을 향상시키고, 네트워킹을 할 수 있었습니다.',
    //   },
    //   {
    //     id: 4,
    //     sector: 'Club',
    //     folderName: '학생회 활동',
    //     subject: '학생회 기획부 활동',
    //     content: '학생회 기획부에서 다양한 행사를 기획하고 운영했습니다.',
    //     results: '행사 성공적 개최, 기획 능력 향상',
    //     overall:
    //       '학생회 활동을 통해 기획력과 운영 능력을 배양할 수 있었습니다.',
    //   },
    // ],
  })
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

  const handleChange = (id: number, field: string, value: string) => {
    const updatedItem = {
      ...portfolio.find(item => item.id === id)!,
      [field]: value,
    }
    updatePortfolioItem(updatedItem)
  }

  const editMutation = useMutation(() => editPortfolio(token!, portfolio), {
    onSuccess: () => {
      queryClient.invalidateQueries('portfolio')
    },
  })

  const handleSave = () => {
    editMutation.mutate()
  }

  const handleDownload = async () => {
    if (token) {
      const successResponse = await getPortfolioFile(token)
      if (successResponse && successResponse.data.result) {
        const fileData = successResponse.data.result

        const blob = new Blob([fileData], { type: 'application/pdf' }) // 파일 유형에 따라 'application/pdf', 'image/png' 등
        const url = URL.createObjectURL(blob)

        // 임시 다운로드 링크 생성
        const a = document.createElement('a')
        a.href = url
        a.download = 'portfolio.pdf' // 파일 이름과 확장자
        document.body.appendChild(a)
        a.click()

        // 링크 제거 및 URL 메모리 해제
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    }
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
                  <div className='text-start mx-auto md:w-[80%]'>
                    <div className='bg-white border border-gray-200 rounded-lg p-10 shadow-lg overflow-hidden'>
                      {Object.entries(groupedPortfolio).map(
                        ([sector, items]) => (
                          <div key={sector}>
                            <h2 className='text-xl font-bold border-b-2 pb-1 mb-5'>
                              {sector}
                            </h2>
                            {items.map(item => (
                              <div key={item.id}>
                                <div>
                                  <label htmlFor={`subject-${item.id}`}>
                                    Subject
                                  </label>
                                  <input
                                    type='text'
                                    id={`subject-${item.id}`}
                                    value={item.subject}
                                    onChange={e =>
                                      handleChange(
                                        item.id,
                                        'subject',
                                        e.target.value,
                                      )
                                    }
                                    className='w-full mb-2 border-none'
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`content-${item.id}`}>
                                    Content
                                  </label>
                                  <input
                                    type='text'
                                    id={`content-${item.id}`}
                                    value={item.content}
                                    onChange={e =>
                                      handleChange(
                                        item.id,
                                        'content',
                                        e.target.value,
                                      )
                                    }
                                    className='w-full mb-2 border-none'
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`results-${item.id}`}>
                                    Results
                                  </label>
                                  <input
                                    type='text'
                                    id={`results-${item.id}`}
                                    value={item.results}
                                    onChange={e =>
                                      handleChange(
                                        item.id,
                                        'results',
                                        e.target.value,
                                      )
                                    }
                                    className='w-full mb-2 border-none'
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`overall-${item.id}`}>
                                    Overall
                                  </label>
                                  <input
                                    type='text'
                                    id={`overall-${item.id}`}
                                    value={item.overall}
                                    onChange={e =>
                                      handleChange(
                                        item.id,
                                        'overall',
                                        e.target.value,
                                      )
                                    }
                                    className='w-full mb-2 border-none'
                                  />
                                </div>
                                <p className='border-b-2 pb-5 mb-5'></p>
                              </div>
                            ))}
                          </div>
                        ),
                      )}
                      <div className='flex'>
                        <Button
                          onClick={handleSave}
                          className='mt-4 mr-1 bg-blue-600 hover:bg-blue-700'
                        >
                          Save
                        </Button>
                        <Button
                          onClick={handleDownload}
                          className='mt-4 bg-blue-600 hover:bg-blue-700'
                        >
                          Download
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
