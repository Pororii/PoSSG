import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import Modal from 'react-modal' // 추가된 부분
import { QueryClient, QueryClientProvider } from 'react-query'
import { RouterProvider } from 'react-router-dom'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

import router from './router'

// const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
const queryClient = new QueryClient()

// 모달의 접근성을 위해 앱 루트를 설정합니다.
Modal.setAppElement('#root') // 추가된 부분

root.render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
)
