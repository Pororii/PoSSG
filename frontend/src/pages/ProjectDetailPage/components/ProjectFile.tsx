import { Button, Modal } from 'flowbite-react'
import React, { useState } from 'react'
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { MdDelete } from 'react-icons/md'

import { deleteFile } from '../../../api/project/postDeleteFile'
import { useFolderStore } from '../../../stores/useFolderStore'

const ProjectFile = (props: {
  name: string
  src: string
  onDeleted: () => void
}) => {
  const token = localStorage.getItem('token')
  const [titleInput] = useState<string>(props.name)
  const { folderInfo } = useFolderStore()
  const [openModal, setOpenModal] = useState(false)

  const handleDeleteFile = async () => {
    if (token && folderInfo && folderInfo.sector && folderInfo.title) {
      const fileInfo = {
        sector: folderInfo.sector,
        title: folderInfo.title,
        file_name: titleInput,
      }
      console.log(fileInfo)

      await deleteFile(token, fileInfo)
      props.onDeleted()
    }
  }

  // 삭제 버튼 클릭 시 팝업을 표시하도록 수정
  const handleDeleteClick = () => {
    setOpenModal(true)
  }

  // 팝업에서 "예" 클릭 시 삭제 진행
  const confirmDelete = async () => {
    await handleDeleteFile()
    setOpenModal(false)
  }

  return (
    <div className='relative flex flex-1 bg-white rounded-lg ml-1 mr-1 shadow-inner outline outline-1 outline-neutral-200 hover:outline-blue-500/50'>
      <figure className='relative w-48 h-full flex flex-col'>
        <div className='relative'>
          <img
            className='h-48 rounded-lg rounded-b-none cursor-pointer object-contain w-full'
            src={props.src}
            alt='Project Folder'
          />
          <div className='absolute top-2 right-2 flex'>
            <MdDelete
              className='text-white bg-black/50 rounded-full p-1 cursor-pointer text-xl'
              onClick={handleDeleteClick} // 기존 삭제 핸들러 대신 팝업 표시 핸들러를 연결
            />
          </div>
        </div>
        <div className='pt-2 pb-2 pl-3 pr-3 flex items-center text-sm font-medium font-PretendardVariable'>
          {titleInput}
        </div>
      </figure>

      {/* 삭제 확인 팝업 */}
      <Modal
        show={openModal}
        size='md'
        onClose={() => setOpenModal(false)}
        popup
      >
        <div className='fixed top-16 left-0 w-full h-full bg-gray-500 bg-opacity-60'></div>
        <div className='flex items-center justify-center fixed inset-0 opacity-100'>
          <div className='z-10 bg-white rounded-lg border-solid  border-black-500 p-70 flex flex-col justify-center items-center'>
            <Modal.Body>
              <div className='text-center px-10'>
                <HiOutlineExclamationCircle className='mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-black-200' />
                <h3 className='mb-5 text-lg font-normal text-gray-500 dark:text-gray-400 shadow-3xl'>
                  Are you sure you want to delete?
                </h3>
                <div className='flex justify-center gap-4'>
                  <Button
                    className='bg-gray-100 text-black w-20 hover:bg-blue-600 hover:text-white'
                    onClick={confirmDelete}
                  >
                    Yes
                  </Button>
                  <Button
                    className='bg-gray-100 text-black w-20 hover:bg-blue-600 hover:text-white'
                    onClick={() => setOpenModal(false)}
                  >
                    No
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ProjectFile
