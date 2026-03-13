import { PropsWithChildren } from 'react'
import { BrandLogo } from './BrandLogo'

export function AuthShell({ children }: PropsWithChildren) {
  return (
    <main className='portal-bg portal-bg-auth min-h-screen p-6'>
      <section className='mx-auto max-w-2xl rounded-[42px] bg-brand px-12 py-10 shadow-2xl ring-1 ring-gold/25'>
        <BrandLogo />
        <div className='mt-10'>{children}</div>
      </section>
    </main>
  )
}
