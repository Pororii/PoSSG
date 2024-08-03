import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Home from './pages/HomePage/Home'
import NotFound from './components/NotFoundPage/NotFound'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: '',
        element: <Home />,
      },
    ],
  },
])

export default router
