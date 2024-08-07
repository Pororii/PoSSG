import React, { useState } from 'react'
import { MdDelete } from 'react-icons/md'

const ProjectPreview = (props: {
  name: string
  src: string
  onDelete: () => void
}) => {
  const [titleInput] = useState<string>(props.name)

  const handleDeleteFile = async () => {
    props.onDelete()
  }

  return (
    <>
      <div
        className='flex flex-1 bg-white rounded-lg ml-1 mr-1 shadow-inner outline outline-1 outline-neutral-200 hover:outline-blue-500/50'
        draggable={false}
      >
        <figure
          className='relative w-48 h-full flex flex-col'
          draggable={false}
        >
          <div className='relative' draggable={false}>
            <img
              className='h-48 rounded-lg rounded-b-none cursor-pointer object-contain w-full'
              src={props.src}
              alt='Project Folder'
              draggable={false}
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
    </>
  )
}

export default ProjectPreview
