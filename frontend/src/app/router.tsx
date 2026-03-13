import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AccountPage } from '@/pages/AccountPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ServicesPage } from '@/pages/ServicesPage'

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/services', element: <ServicesPage /> },
  { path: '/history', element: <HistoryPage /> },
  { path: '/account', element: <AccountPage /> },
  { path: '*', element: <Navigate to='/' replace /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
