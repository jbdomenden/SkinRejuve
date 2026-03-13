import { AdminShell } from '@/components/layout/AdminShell'

const cards = [
  { label: 'Pending Appointments', value: '14' },
  { label: 'Pending Registrations', value: '7' },
  { label: 'Today Check-ins', value: '5' },
  { label: 'Completed This Week', value: '32' },
]

export function AdminDashboardPage() {
  return (
    <AdminShell>
      <h1 className='font-serif text-6xl text-[#4a2a00]'>Admin Dashboard</h1>

      <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {cards.map((card) => (
          <article key={card.label} className='rounded-md border border-[#8a5a2f]/30 bg-[#f8f2e9] p-5'>
            <p className='text-sm uppercase tracking-[0.16em] text-[#6f4520]'>{card.label}</p>
            <p className='mt-3 font-serif text-5xl text-[#4a2a00]'>{card.value}</p>
          </article>
        ))}
      </div>

      <section className='mt-7 rounded-md border border-[#8a5a2f]/30 bg-[#f8f2e9] p-6'>
        <h2 className='font-serif text-4xl text-[#4a2a00]'>Queue Snapshot</h2>
        <div className='mt-4 grid gap-3 text-[#5b3200] md:grid-cols-2'>
          <div className='rounded bg-white/80 p-4'>
            <p className='text-sm tracking-[0.14em]'>NEXT APPOINTMENT REVIEW</p>
            <p className='mt-2 text-xl font-semibold'>Ana Dela Cruz • Acne Laser</p>
            <p className='text-sm'>March 17, 2026 • 09:00 AM</p>
          </div>
          <div className='rounded bg-white/80 p-4'>
            <p className='text-sm tracking-[0.14em]'>LATEST REGISTRATION</p>
            <p className='mt-2 text-xl font-semibold'>Paolo Reyes</p>
            <p className='text-sm'>Submitted intake & privacy consent</p>
          </div>
        </div>
      </section>
    </AdminShell>
  )
}
