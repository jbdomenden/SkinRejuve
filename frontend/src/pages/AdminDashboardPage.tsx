import { useState } from 'react'
import { AdminShell } from '@/components/layout/AdminShell'
import { AdminModal } from '@/components/ui/AdminModal'
import { ReportRequest, exportModuleReportCsv } from '@/lib/reports'

const cards = [
  { label: 'Pending Appointments', value: '14' },
  { label: 'Pending Registrations', value: '7' },
  { label: 'Today Check-ins', value: '5' },
  { label: 'Completed This Week', value: '32' },
]

const initialReport: ReportRequest = {
  module: 'All Modules',
  fromDate: '2026-03-01',
  toDate: '2026-03-31',
  status: 'ALL',
  staff: 'ALL',
}

export function AdminDashboardPage() {
  const [open, setOpen] = useState(false)
  const [request, setRequest] = useState<ReportRequest>(initialReport)

  return (
    <AdminShell>
      <div className='flex items-center justify-between'>
        <h1 className='font-serif text-6xl text-[#4a2a00]'>Admin Dashboard</h1>
        <button className='portal-btn-small' onClick={() => setOpen(true)}>Generate Report</button>
      </div>

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

      {open ? (
        <AdminModal
          title='Generate Admin Report'
          onClose={() => setOpen(false)}
          actions={
            <button
              className='portal-btn-small'
              onClick={() => {
                exportModuleReportCsv(request)
                setOpen(false)
              }}
            >
              Download CSV
            </button>
          }
        >
          <div className='grid gap-3 md:grid-cols-2'>
            <input className='portal-input' value={request.module} onChange={(e) => setRequest((v) => ({ ...v, module: e.target.value }))} placeholder='Module' />
            <input className='portal-input' value={request.status} onChange={(e) => setRequest((v) => ({ ...v, status: e.target.value }))} placeholder='Status' />
            <input className='portal-input' type='date' value={request.fromDate} onChange={(e) => setRequest((v) => ({ ...v, fromDate: e.target.value }))} />
            <input className='portal-input' type='date' value={request.toDate} onChange={(e) => setRequest((v) => ({ ...v, toDate: e.target.value }))} />
            <input className='portal-input md:col-span-2' value={request.staff} onChange={(e) => setRequest((v) => ({ ...v, staff: e.target.value }))} placeholder='Staff' />
          </div>
        </AdminModal>
      ) : null}
    </AdminShell>
  )
}
