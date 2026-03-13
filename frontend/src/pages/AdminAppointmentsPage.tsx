import { useState } from 'react'
import { AdminShell } from '@/components/layout/AdminShell'
import { AdminModal } from '@/components/ui/AdminModal'

const rows = [
  { id: 'APT-1022', patient: 'Ana Dela Cruz', service: 'Acne Laser', date: '2026-03-17', status: 'PENDING' },
  { id: 'APT-1023', patient: 'Lea Ramos', service: 'Hydrafacial', date: '2026-03-17', status: 'PENDING' },
]

export function AdminAppointmentsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [resolution, setResolution] = useState<'approved' | 'rejected' | null>(null)

  return (
    <AdminShell>
      <h1 className='font-serif text-6xl text-[#4a2a00]'>Appointment Queue</h1>
      <div className='mt-6 rounded-md border border-[#8a5a2f]/30 bg-[#f8f2e9] p-5'>
        <table className='w-full text-left text-[#4a2a00]'>
          <thead className='text-sm uppercase tracking-[0.16em] text-[#6f4520]'>
            <tr>
              <th className='py-3'>ID</th><th>Patient</th><th>Service</th><th>Date</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className='border-t border-[#8a5a2f]/20' key={row.id}>
                <td className='py-3'>{row.id}</td><td>{row.patient}</td><td>{row.service}</td><td>{row.date}</td><td>{row.status}</td>
                <td>
                  <button className='portal-btn-small' onClick={() => setSelectedId(row.id)}>Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedId ? (
        <AdminModal
          title={`Review ${selectedId}`}
          onClose={() => {
            setSelectedId(null)
            setResolution(null)
          }}
          actions={
            resolution ? (
              <button className='portal-btn-small' onClick={() => setSelectedId(null)}>Done</button>
            ) : (
              <>
                <button className='border border-[#8a5a2f]/45 px-5 py-2' onClick={() => setResolution('rejected')}>Reject</button>
                <button className='portal-btn-small' onClick={() => setResolution('approved')}>Approve</button>
              </>
            )
          }
        >
          {!resolution ? (
            <div className='space-y-2'>
              <p><strong>Patient:</strong> Ana Dela Cruz</p>
              <p><strong>Requested:</strong> Acne Laser, March 17 • 09:00 AM</p>
              <p><strong>Note:</strong> First-time consultation with recent topical treatment.</p>
            </div>
          ) : resolution === 'approved' ? (
            <p className='text-lg'>✅ Appointment approved and patient was notified by email.</p>
          ) : (
            <div>
              <p className='text-lg'>❌ Appointment rejected.</p>
              <p className='text-sm text-[#6f4520]'>Reason saved: Requested slot conflicts with provider block schedule.</p>
            </div>
          )}
        </AdminModal>
      ) : null}
    </AdminShell>
  )
}
