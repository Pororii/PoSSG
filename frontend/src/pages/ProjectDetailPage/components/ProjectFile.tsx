import React, { useState } from 'react'
import { MdDelete } from 'react-icons/md'

import { deleteFile } from '../../../api/project/postDeleteFile'
import { useFolderStore } from '../../../stores/useFolderStore'

const ProjectFile = (props: {
  file_name: string
  name: string
  src: string
  onDeleted: () => void
}) => {
  const token = localStorage.getItem('token')
  const [titleInput] = useState<string>(props.name)
  const { folderInfo } = useFolderStore()

  const handleDeleteFile = async () => {
    if (token && folderInfo && folderInfo.sector && folderInfo.title) {
      const fileInfo = {
        sector: folderInfo.sector,
        title: folderInfo.title,
        file_name: props.file_name,
      }

      await deleteFile(token, fileInfo)
      props.onDeleted()
    }
  }

  return (
    <div className='flex flex-1 bg-white rounded-lg ml-1 mr-1 shadow-inner outline outline-1 outline-neutral-200 hover:outline-blue-500/50'>
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
              onClick={handleDeleteFile}
            />
          </div>
        </div>
        <div className='pt-2 pb-2 pl-3 pr-3 flex items-center text-sm font-medium font-PretendardVariable'>
          {titleInput}
        </div>
      </figure>
    </div>
  )
}

export default ProjectFile
