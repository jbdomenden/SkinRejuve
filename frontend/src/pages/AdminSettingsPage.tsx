import { AdminShell } from '@/components/layout/AdminShell'

export function AdminSettingsPage() {
  return (
    <AdminShell>
      <h1 className='font-serif text-6xl text-[#4a2a00]'>Admin Settings</h1>
      <div className='mt-6 grid gap-5 lg:grid-cols-2'>
        <section className='rounded-md border border-[#8a5a2f]/30 bg-[#f8f2e9] p-6'>
          <h2 className='font-serif text-3xl text-[#4a2a00]'>SMTP & Notification</h2>
          <div className='mt-4 space-y-3'>
            <input className='portal-input' placeholder='SMTP host' defaultValue='localhost' />
            <input className='portal-input' placeholder='SMTP port' defaultValue='1025' />
            <input className='portal-input' placeholder='From address' defaultValue='no-reply@skinrejuve.local' />
          </div>
        </section>

        <section className='rounded-md border border-[#8a5a2f]/30 bg-[#f8f2e9] p-6'>
          <h2 className='font-serif text-3xl text-[#4a2a00]'>Appointment Rules</h2>
          <div className='mt-4 space-y-3'>
            <input className='portal-input' placeholder='Minimum booking lead time (hours)' defaultValue='24' />
            <input className='portal-input' placeholder='Cancellation cut-off (hours)' defaultValue='12' />
            <input className='portal-input' placeholder='Default slot duration (minutes)' defaultValue='60' />
          </div>
        </section>
      </div>
      <button className='portal-btn mt-6'>SAVE CHANGES</button>
    </AdminShell>
  )
}
