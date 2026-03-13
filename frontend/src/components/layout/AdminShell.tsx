import { PropsWithChildren } from 'react'
import { AdminSidebar } from './AdminSidebar'

export function AdminShell({ children }: PropsWithChildren) {
  return (
    <main className='portal-bg flex min-h-screen'>
      <AdminSidebar />
      <section className='flex-1 p-8'>{children}</section>
    </main>
  )
}
