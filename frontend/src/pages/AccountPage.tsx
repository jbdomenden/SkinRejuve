import { PortalShell } from '@/components/layout'

export function AccountPage() {
  return (
    <PortalShell>
      <h1 className='font-serif text-8xl text-ivory'>Account Settings</h1>

      <section className='mt-6 rounded border-2 border-brand/50 bg-paper p-6 text-brand'>
        <h2 className='text-6xl font-semibold'>PATIENT</h2>
      </section>

      <section className='mt-6 rounded border-2 border-brand/50 bg-paper p-6 text-brand'>
        <div className='flex items-start justify-between'>
          <h3 className='text-7xl font-serif'>PERSONAL INFORMATION</h3>
          <button className='portal-btn-small'>EDIT</button>
        </div>
        <div className='mt-4 grid grid-cols-2 gap-4 text-4xl'>
          <p><b>FULLNAME:</b> CARMELOJOHNCRUZ@GMAIL.COM</p>
          <p><b>USERNAME:</b> PATIENT123</p>
          <p><b>BIRTHDAY:</b> MARCH 4, 2026</p>
          <p><b>PHONE NUMBER:</b> +63 967 086 5599</p>
        </div>
      </section>
    </PortalShell>
  )
}
