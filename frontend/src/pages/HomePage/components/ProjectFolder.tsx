import { CustomFlowbiteTheme, TextInput, Button, Modal } from 'flowbite-react'
import React, { useState } from 'react'
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { MdEdit, MdDelete, MdPhoto } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

import { manageFolder } from '../../../api/project/postManageFolder'
import { uploadThumbnail } from '../../../api/project/postUploadThumbnail'
import { useFolderStore } from '../../../stores/useFolderStore'

const ProjectFolder = (props: {
  sector: string
  title: string
  src: string
  setError: (error: string | null) => void
  onFolderDeleted: () => void
}) => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [editMode, setEditMode] = useState(false)
  const [titleInput, setTitleInput] = useState<string>(props.title)
  const [, setSelectedFile] = useState<File | null>(null)
  const [previewSrc, setPreviewSrc] = useState<string>(props.src)
  const { setSelectedFolder } = useFolderStore()
  const [openModal, setOpenModal] = useState(false)

  const handleFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleInput(e.target.value)
  }

  const titleInputTheme: CustomFlowbiteTheme['textInput'] = {
    field: {
      input: {
        colors: {
          gray: 'border-none text-gray-900',
        },
      },
    },
  }

  const handleEditToggle = () => {
    setEditMode(!editMode)
  }

  const handleFolderNameSubmit = async () => {
    // 폴더명 수정 후 백엔드에 수정된 내용 전달
    if (token) {
      const folderResult = await manageFolder(token, {
        sector: props.sector,
        title: props.title,
        new_title: titleInput,
        is_Exist: 1,
      })
      // 폴더 이름이 중복되었을 경우
      if (folderResult?.data?.message === 'same') {
        // 에러 메시지 표시 또는 처리
        console.log('Folder name already exists!')
        props.setError('이미 존재하는 폴더 이름입니다.')
        return // 수정 모드를 유지하고 함수 종료
      }
    }

    setEditMode(false) // 수정 모드 종료
  }

  const handleDeleteFolder = async () => {
    if (token) {
      const folderResult = await manageFolder(token, {
        sector: props.sector,
        title: titleInput,
        new_title: '',
        is_Exist: 2,
      })
      if (folderResult && folderResult.data) {
        props.onFolderDeleted()
      }
      setOpenModal(false)
    }
  }

  //서버에 올리는 용도(썸네일)
  const handleUploadPhoto = async (file: File) => {
    if (token) {
      const formData = new FormData()
      formData.append('sector', props.sector)
      formData.append('folderName', titleInput)
      formData.append('file', file)

      console.log('Sending form data:', {
        sector: props.sector,
        folderName: titleInput,
        file: file.name,
      })

      try {
        const response = await uploadThumbnail(token, formData)
        console.log('Response from server:', response)
        if (response?.data.message === 'Upload success') {
          setPreviewSrc(URL.createObjectURL(file))
        }
      } catch (error) {
        console.error('Error uploading thumbnail:', error)
      }
    }
  }

  //파일 선택하고 업로드 (프론트앤드 쪽)
  const handleFileUpload = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setSelectedFile(file)
        setPreviewSrc(URL.createObjectURL(file))

        await handleUploadPhoto(file) // handleUploadPhoto 호출
      }
    }
    fileInput.click()
  }

  const handleFolderClick = () => {
    const folderInfo = {
      sector: props.sector,
      title: titleInput,
      src: props.src,
    }
    setSelectedFolder(folderInfo)
    navigate(`/project-detail/${props.sector}/${titleInput}`)
  }

  return (
    <>
      <div className='flex flex-1 bg-white rounded-lg ml-1 mr-1 shadow-inner outline outline-1 outline-neutral-200 hover:outline-blue-500/50'>
        <figure className='relative w-full h-full flex flex-col'>
          <div className='relative'>
            <div
              className='h-48 rounded-lg rounded-b-none cursor-pointer object-cover w-full'
              style={{
                backgroundImage: `url(${previewSrc})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              role='button'
              onClick={handleFolderClick}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleFolderClick()
                }
              }}
              tabIndex={0}
              aria-label='Project Folder'
            />
            <div className='absolute top-2 right-2 flex'>
              <MdDelete
                className='text-white bg-black/50 rounded-full p-1 cursor-pointer text-xl'
                onClick={() => setOpenModal(true)}
              />
              <MdPhoto
                className='text-white bg-black/50 rounded-full p-1 ml-2 cursor-pointer text-xl'
                onClick={handleFileUpload}
              />
            </div>
          </div>
          <div className='pt-2 pb-2 pl-3 pr-3 flex items-center'>
            <TextInput
              name='title'
              theme={titleInputTheme}
              type='text'
              id='title'
              onChange={handleFolderNameChange}
              value={titleInput}
              placeholder='title'
              disabled={!editMode}
            />
            <MdEdit
              className={`absolute right-4 cursor-pointer ${
                editMode ? 'text-blue-700' : ''
              }`}
              onClick={() => {
                if (editMode) {
                  handleFolderNameSubmit() // 수정 완료 버튼 클릭 시 수정 내용을 부모 컴포넌트로 전달
                } else {
                  handleEditToggle() // 수정 모드 토글
                }
              }}
            />
          </div>
        </figure>
      </div>

      <Modal
        show={openModal}
        size='md'
        onClose={() => setOpenModal(false)}
        popup
      >
        <div className='fixed top-20 left-0 w-full h-full bg-gray-500 bg-opacity-60'></div>
        <div className='flex items-center justify-center fixed inset-0 opacity-100'>
          <div className='z-10 bg-white rounded-lg border-solid  border-black-500 p-70 flex flex-col justify-center items-center'>
            <Modal.Body>
              <div className='text-center px-10'>
                <HiOutlineExclamationCircle className='mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-black-200' />
                <h3 className='mb-5 text-lg font-normal text-gray-500 dark:text-gray-400 shadow-3xl'>
                  정말 삭제하시겠습니까?
                </h3>
                <div className='flex justify-center gap-4'>
                  <Button
                    className='bg-gray-100 text-black w-20 hover:bg-blue-600 hover:text-white'
                    onClick={handleDeleteFolder}
                  >
                    네
                  </Button>
                  <Button
                    className='bg-gray-100 text-black w-20 hover:bg-blue-600 hover:text-white'
                    onClick={() => setOpenModal(false)}
                  >
                    아니오
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

export default ProjectFolder
