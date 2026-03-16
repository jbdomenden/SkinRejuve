import { PropsWithChildren } from 'react'
import { PortalSidebar } from './PortalSidebar'

export function PortalShell({ children }: PropsWithChildren) {
  return (
    <main className='portal-bg flex min-h-screen'>
      <PortalSidebar />
      <section className='flex-1 p-10'>{children}</section>
    </main>
  )
}
