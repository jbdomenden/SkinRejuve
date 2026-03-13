import { PropsWithChildren } from 'react'
import { BrandLogo } from './BrandLogo'

export function AuthShell({ children }: PropsWithChildren) {
  return (
    <main className='portal-bg min-h-screen p-6'>
      <section className='mx-auto max-w-2xl rounded-[36px] bg-brand p-10 shadow-2xl ring-1 ring-gold/20'>
        <BrandLogo />
        <div className='mt-10'>{children}</div>
      </section>
    </main>
  )
}
