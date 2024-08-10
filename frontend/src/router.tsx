import { createBrowserRouter } from 'react-router-dom'

import App from './App'
import NotFound from './components/NotFoundPage/NotFound'
import Home from './pages/HomePage/Home'
import Login from './pages/LoginPage/Login'
import Portfolio from './pages/PortfolioPage/Portfolio'
import ProjectDetail from './pages/ProjectDetailPage/ProjectDetail'
import Register from './pages/RegisterPage/Register'

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
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'project-detail/:sector/:folderName',
        element: <ProjectDetail />,
      },
      {
        path: 'portfolio',
        element: <Portfolio />,
      },
    ],
  },
])

export default router
