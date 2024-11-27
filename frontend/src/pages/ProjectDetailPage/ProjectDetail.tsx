import { Button } from 'flowbite-react'
import React, { useEffect, useRef, useState } from 'react'
import { FaWandMagicSparkles } from 'react-icons/fa6'
import { Document, Page, pdfjs } from 'react-pdf'
import { useParams } from 'react-router-dom'

import ProjectFile from './components/ProjectFile'
import ProjectPreview from './components/ProjectPreview'
import { getMyProjectFiles } from '../../api/project/postMyProjectFiles'
import { uploadProjectFiles } from '../../api/project/postProjectFiles'
// import { useFolderStore } from '../../stores/useFolderStore'
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const ProjectDetail = () => {
  const { folderName } = useParams() as { folderName: string }
  const { sector } = useParams() as { sector: string }
  //   const [folderInfo, setFolderInfo] = useFolderStore()
  const [isActive, setActive] = useState<boolean>(false)
  const [isExist, setExist] = useState<boolean>(false)
  const [filePreviews, setFilePreviews] = useState<
    { file: File; preview: string; name: string }[]
  >([])
  const [fileFinals, setFileFinals] = useState<
    { file: File; preview: string; name: string }[]
  >([])
  const [showPopup, setShowPopup] = useState<boolean>(false)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const [, setIsLoading] = useState<boolean>(false)

  const popupRef = useRef<HTMLDivElement>(null)
  const token = localStorage.getItem('token')

  const folder = {
    sector: sector,
    title: folderName,
  }

  const Logo = () => (
    <svg
      className='w-24 h-24 mt-32 pointer-events-none'
      x='0px'
      y='0px'
      viewBox='0 0 24 24'
    >
      <path fill='transparent' d='M0,0h24v24H0V0z' />
      <path
        fill='#000'
        d='M20.5,5.2l-1.4-1.7C18.9,3.2,18.5,3,18,3H6C5.5,3,5.1,3.2,4.8,3.5L3.5,5.2C3.2,5.6,3,6,3,6.5V19  c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V6.5C21,6,20.8,5.6,20.5,5.2z M12,17.5L6.5,12H10v-2h4v2h3.5L12,17.5z M5.1,5l0.8-1h12l0.9,1  H5.1z'
      />
    </svg>
  )

  const handleDragStart = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setActive(true)
  }

  const handleDragEnd = () => setActive(false)

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setActive(false)
    const files = Array.from(e.dataTransfer.files).filter(
      file =>
        file.type === 'application/pdf' ||
        file.type === 'image/jpeg' ||
        file.type === 'image/png',
    )
    uploadFiles(files)
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(Array.from(e.target.files))
    }
  }

  const uploadFiles = (files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        if (e.target && e.target.result) {
          const modifiedName = file.name.replace(/_/g, ' ')
          setFilePreviews(prevFilePreviews => [
            ...prevFilePreviews,
            { file, preview: e.target?.result as string, name: modifiedName },
          ])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handlePreviewDelete = (index: number) => {
    setFilePreviews(prevFilePreviews =>
      prevFilePreviews.filter((_, i) => i !== index),
    )
  }

  const handleUploadButtonClick = async () => {
    if (token) {
      setIsLoading(true)

      const formData = new FormData()
      formData.append('sector', sector)
      formData.append('title', folderName)

      filePreviews.forEach(({ file }) => {
        formData.append('files', file)
      })

      const response = await uploadProjectFiles(token, formData)
      console.log(response?.data.message)

      setShowPopup(false)
      setActive(false)
      setExist(true)
      setFileFinals(prevFileFinals => [...prevFileFinals, ...filePreviews])
      setFilePreviews([])
      setIsLoading(false)
    }
  }

  const handlePopUpButtonClick = () => {
    setShowPopup(true)
  }

  const handleOutsideClick = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setShowPopup(false)
      setFilePreviews([])
    }
  }

  const handleSummaryButtonClick = async () => {
    //
  }

  const fetchFiles = async () => {
    console.log(sector)
    if (token) {
      const successResponse = await getMyProjectFiles(token, folder)
      console.log(successResponse?.data)

      if (successResponse && successResponse.data) {
        if (successResponse.data.files.length > 0) {
          setExist(true)
        }

        const files = successResponse.data.files.map(({ file, src }) => ({
          file: file,
          preview: src,
          name: file.toString().split('/').pop()?.replace(/_/g, ' ') as string,
        }))
        setFileFinals(files)
      }
    }
  }

  const handleFileDeleted = (fileName: string) => {
    setFileFinals(prevFiles => prevFiles.filter(file => file.name !== fileName))
    fetchFiles()
    console.log('파일 삭제하고 다시 로딩')
  }

  useEffect(() => {
    fetchFiles()
  }, [token])

  useEffect(() => {
    const updateContainerWidth = () => {
      const contentContainer = document.getElementById('content-container')
      if (contentContainer) {
        const width = contentContainer.offsetWidth
        setContainerWidth(width)
      }
    }

    updateContainerWidth()
    window.addEventListener('resize', updateContainerWidth)
    document.addEventListener('mousedown', handleOutsideClick)

    return () => {
      window.removeEventListener('resize', updateContainerWidth)
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  return (
    <>
      <div className='flex w-screen justify-center self-stretch bg-white text-gray-700'>
        {/* {isLoading && (
      )} */}
        <div className='flex flex-1 flex-col md:flex-row box-border max-w-screen-xl items-center justify-start px-5 md:px-20 xl:px-10 pt-20 pb-20'>
          <div className='flex-1 flex-grow-4 self-start max-w-none prose-lg mx-4 text-gray-700'>
            <div id='content-container' className='mx-auto md:w-[80%]'>
              <div className='flex justify-between items-center pt-12 pb-2 border-b border-gray-500'>
                <p className='text-xl font-PretendardVariable font-semibold ml-3'>
                  {sector}&nbsp;/&nbsp;{folderName}
                </p>
                <div className='flex items-center'>
                  <Button
                    className='text-black border-slate-300 custom-gradient-hover from-gradient-start to-gradient-end h-8 font-semibold mr-3'
                    onClick={handleSummaryButtonClick}
                  >
                    <FaWandMagicSparkles />
                    &nbsp;
                    <p className='text-xs'>Summary</p>
                  </Button>
                  <button
                    type='submit'
                    className='bg-black text-white text-xs font-PretendardVariable font-normal rounded-md py-2 px-5 transition duration-200 ease-in-out cursor-pointer'
                    onClick={handlePopUpButtonClick}
                  >
                    Upload
                  </button>
                </div>
              </div>
              <div className='mt-5'>
                <div className='grid grid-cols-1 md:grid-cols-5 gap-2 ml-3 mr-3 mt-5 mb-5'>
                  {fileFinals.map(fileFinals => (
                    <div
                      key={fileFinals.file.name}
                      className='flex flex-col w-full pb-1'
                    >
                      <ProjectFile
                        name={fileFinals.name}
                        src={fileFinals.preview}
                        onDeleted={() => handleFileDeleted(fileFinals.name)}
                      />
                    </div>
                  ))}
                </div>
                {!isExist && (
                  <div className='mt-5'>
                    <label
                      className={`bg-white rounded-lg outline-dashed outline-2 outline-gray-300 hover:outline-gray-500 p-70 flex flex-col justify-center items-center cursor-pointer${isActive ? ' bg-efeef3 border-111' : ''}`}
                      onDragEnter={handleDragStart}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragEnd}
                      onDrop={handleDrop}
                    >
                      {filePreviews.length ? (
                        <>
                          <div className='grid grid-cols-1 md:grid-cols-5 gap-2 ml-3 mr-3 mt-5 mb-5'>
                            {filePreviews.map((filePreviews, index) => (
                              <div
                                key={index}
                                className='flex flex-col w-full pb-1'
                              >
                                {filePreviews.file.type ===
                                  'application/pdf' && (
                                  <Document
                                    file={filePreviews.file}
                                    className={'hidden'}
                                    onLoadSuccess={pdf => {
                                      pdf.getPage(1).then(page => {
                                        const viewport = page.getViewport({
                                          scale: 1,
                                        })
                                        const canvas =
                                          document.createElement('canvas')
                                        const canvasContext =
                                          canvas.getContext('2d')
                                        if (canvasContext) {
                                          canvas.width = viewport.width
                                          canvas.height = viewport.height
                                          page
                                            .render({ canvasContext, viewport })
                                            .promise.then(() => {
                                              canvas.toBlob(blob => {
                                                if (blob) {
                                                  const imageUrl =
                                                    URL.createObjectURL(blob)
                                                  setFilePreviews(
                                                    prevFilePreviews => {
                                                      const updatedPreviews = [
                                                        ...prevFilePreviews,
                                                      ]
                                                      updatedPreviews[
                                                        index
                                                      ].preview = imageUrl
                                                      return updatedPreviews
                                                    },
                                                  )
                                                }
                                              })
                                            })
                                        }
                                      })
                                    }}
                                  >
                                    <Page pageNumber={1} />
                                  </Document>
                                )}
                                <ProjectPreview
                                  name={filePreviews.name}
                                  src={filePreviews.preview}
                                  onDelete={() => handlePreviewDelete(index)}
                                />
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <Logo />
                          <p className='font-medium text-lg my-20 mb-10'>
                            Click or drop multiple files here!
                          </p>
                          <p className='mb-3 text-sm text-blue-500'>
                            Only JPG, JPEG, PNG, and PDF formats are accepted
                          </p>
                          <p className='mb-32 text-sm'>Maximum 3MB per file</p>
                        </>
                      )}
                      <input
                        type='file'
                        className='file hidden'
                        accept='.png, .jpeg, .pdf,.jpg'
                        onChange={handleUpload}
                        multiple
                      />
                    </label>
                    <button
                      className={`w-full text-white text-sm font-normal rounded-md py-3 mt-4 transition duration-200 ease-in-out cursor-pointer ${filePreviews.length ? 'bg-blue-600' : 'bg-black'}`}
                      onClick={handleUploadButtonClick}
                    >
                      Upload
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {showPopup && (
          <>
            <div className='fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-60 flex items-center justify-center'>
              {/* 모달 백그라운드 */}
            </div>
            <div
              ref={popupRef}
              className={`mx-auto h-3/7 bg-white rounded-lg border-1 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center justify-center mt-4 z-1`}
              style={{ width: containerWidth }}
            >
              <div className='m-4'>
                <label
                  className={`bg-white rounded-lg outline-dashed outline-2 outline-gray-300 hover:outline-gray-500 p-70 flex flex-col justify-center items-center cursor-pointer${isActive ? ' bg-efeef3 border-111' : ''}`}
                  onDragEnter={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragEnd}
                  onDrop={handleDrop}
                >
                  {filePreviews.length ? (
                    <>
                      <div className='grid grid-cols-1 md:grid-cols-5 gap-2 ml-3 mr-3 mt-5 mb-5'>
                        {filePreviews.map((filePreviews, index) => (
                          <div
                            key={index}
                            className='flex flex-col w-full pb-1'
                          >
                            {filePreviews.file.type === 'application/pdf' && (
                              <Document
                                file={filePreviews.file}
                                className={'hidden'}
                                onLoadSuccess={pdf => {
                                  pdf.getPage(1).then(page => {
                                    const viewport = page.getViewport({
                                      scale: 1,
                                    })
                                    const canvas =
                                      document.createElement('canvas')
                                    const canvasContext =
                                      canvas.getContext('2d')
                                    if (canvasContext) {
                                      canvas.width = viewport.width
                                      canvas.height = viewport.height
                                      page
                                        .render({ canvasContext, viewport })
                                        .promise.then(() => {
                                          canvas.toBlob(blob => {
                                            if (blob) {
                                              const imageUrl =
                                                URL.createObjectURL(blob)
                                              setFilePreviews(
                                                prevFilePreviews => {
                                                  const updatedPreviews = [
                                                    ...prevFilePreviews,
                                                  ]
                                                  updatedPreviews[
                                                    index
                                                  ].preview = imageUrl
                                                  return updatedPreviews
                                                },
                                              )
                                            }
                                          })
                                        })
                                    }
                                  })
                                }}
                              >
                                <Page pageNumber={1} />
                              </Document>
                            )}
                            <ProjectPreview
                              name={filePreviews.name}
                              src={filePreviews.preview}
                              onDelete={() => handlePreviewDelete(index)}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <Logo />
                      <p className='font-medium text-lg my-20 mb-10'>
                        Click or drop multiple files here!
                      </p>
                      <p className='mb-32 text-sm'>Maximum 3MB per file</p>
                    </>
                  )}
                  <input
                    type='file'
                    className='file hidden'
                    accept='.png, .jpeg, .pdf'
                    onChange={handleUpload}
                    multiple
                  />
                </label>
                <button
                  className={`w-full text-white text-sm font-normal rounded-md py-3 mt-4 transition duration-200 ease-in-out cursor-pointer ${filePreviews.length ? 'bg-blue-600' : 'bg-black'}`}
                  onClick={handleUploadButtonClick}
                >
                  Upload
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default ProjectDetail
