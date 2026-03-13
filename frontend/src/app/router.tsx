import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AccountPage } from '@/pages/AccountPage'
import { AdminAppointmentsPage } from '@/pages/AdminAppointmentsPage'
import { AdminAuditLogPage } from '@/pages/AdminAuditLogPage'
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { AdminRegistrationPage } from '@/pages/AdminRegistrationPage'
import { AdminReviewPage } from '@/pages/AdminReviewPage'
import { AdminSettingsPage } from '@/pages/AdminSettingsPage'
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
  { path: '/admin/dashboard', element: <AdminDashboardPage /> },
  { path: '/admin/appointments', element: <AdminAppointmentsPage /> },
  { path: '/admin/registration', element: <AdminRegistrationPage /> },
  { path: '/admin/review', element: <AdminReviewPage /> },
  { path: '/admin/audit-log', element: <AdminAuditLogPage /> },
  { path: '/admin/settings', element: <AdminSettingsPage /> },
  { path: '*', element: <Navigate to='/' replace /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
