import { useState } from 'react'
import { AdminShell } from '@/components/layout/AdminShell'
import { AdminModal } from '@/components/ui/AdminModal'
import { exportCsv } from '@/lib/reports'

const rows = [
  { name: 'Paolo Reyes', email: 'paolo@mail.com', submitted: '2026-03-14', status: 'PENDING' },
  { name: 'Mina Santos', email: 'mina@mail.com', submitted: '2026-03-14', status: 'PENDING' },
]

export function AdminRegistrationPage() {
  const [open, setOpen] = useState(false)

  return (
    <AdminShell>
      <div className='flex items-center justify-between'>
        <h1 className='font-serif text-6xl text-[#4a2a00]'>Registration Queue</h1>
        <div className='flex gap-2'>
          <button
            className='portal-btn-small'
            onClick={() =>
              exportCsv('registrations-report.csv', [
                ['name', 'email', 'submitted', 'status'],
                ...rows.map((row) => [row.name, row.email, row.submitted, row.status]),
              ])
            }
          >
            EXPORT CSV
          </button>
          <button className='portal-btn-small' onClick={() => setOpen(true)}>
            + Add User
          </button>
        </div>
      </div>

      <div className='mt-6 rounded-md border border-[#8a5a2f]/30 bg-[#f8f2e9] p-5'>
        {rows.map((row) => (
          <article key={row.email} className='mb-3 flex items-center justify-between rounded bg-white/80 p-4 text-[#4a2a00]'>
            <div>
              <p className='text-xl font-semibold'>{row.name}</p>
              <p className='text-sm'>
                {row.email} • Submitted {row.submitted}
              </p>
            </div>
            <div className='flex gap-2'>
              <button className='border border-[#8a5a2f]/45 px-4 py-2'>Reject</button>
              <button className='portal-btn-small'>Approve</button>
            </div>
          </article>
        ))}
      </div>

      {open ? (
        <AdminModal
          title='Create Patient Account'
          onClose={() => setOpen(false)}
          actions={
            <button className='portal-btn-small' onClick={() => setOpen(false)}>
              Create User
            </button>
          }
        >
          <div className='grid gap-3 md:grid-cols-2'>
            <input className='portal-input' placeholder='First Name' />
            <input className='portal-input' placeholder='Last Name' />
            <input className='portal-input md:col-span-2' placeholder='Email' />
            <textarea className='portal-input md:col-span-2' placeholder='Intake summary / allergies / medications' rows={4} />
          </div>
        </AdminModal>
      ) : null}
    </AdminShell>
  )
}
