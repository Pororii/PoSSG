import React, { useState } from 'react'

interface KeywordInputProps {
  keywords: string[]
  setKeywords: React.Dispatch<React.SetStateAction<string[]>>
}

const KeywordInput: React.FC<KeywordInputProps> = ({
  keywords,
  setKeywords,
}) => {
  const [inputValue, setInputValue] = useState<string>('')
  const [isComposing, setIsComposing] = useState<boolean>(false)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposing) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (inputValue.trim()) {
        setKeywords([...keywords, inputValue.trim()])
        setInputValue('')
      }
    }
  }

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index))
  }

  return (
    <div className='mb-4'>
      <p className='mb-1 ml-1 text-sm'>희망태그</p>
      <input
        type='text'
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        placeholder='키워드를 입력하고 엔터를 누르세요'
        className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-96 p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
      />
      <div className='flex flex-wrap gap-2 mt-2'>
        {keywords.map((keyword, index) => (
          <div
            key={index}
            className='flex items-center px-4 py-2 bg-blue-100 text-blue-900 rounded-full'
          >
            <span>{keyword}</span>
            <button
              type='button'
              onClick={() => handleRemoveKeyword(index)}
              className='ml-2 text-red-500'
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KeywordInput
