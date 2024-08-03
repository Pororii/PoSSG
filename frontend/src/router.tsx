import { createBrowserRouter } from 'react-router-dom'

import App from './App'
import NotFound from './components/NotFoundPage/NotFound'
import Home from './pages/HomePage/Home'
import Login from './pages/LoginPage/Login'

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
      {
        path: 'login',
        element: <Login />,
      },
    ],
  },
])

export default router
