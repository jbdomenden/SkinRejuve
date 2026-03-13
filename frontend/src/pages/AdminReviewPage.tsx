import { useMemo, useState } from 'react'
import { AdminShell } from '@/components/layout/AdminShell'
import { exportCsv } from '@/lib/reports'

type ReviewTab = 'appointments' | 'registrations' | 'treatment_uploads' | 'profile_updates'

type ReviewItem = {
  id: string
  module: ReviewTab
  subject: string
  details: string
  submittedAt: string
}

const pendingItems: ReviewItem[] = [
  { id: 'REV-1', module: 'appointments', subject: 'Ana Dela Cruz', details: 'Reschedule request for Acne Laser', submittedAt: '2026-03-15 09:10' },
  { id: 'REV-2', module: 'registrations', subject: 'Paolo Reyes', details: 'New patient registration with intake', submittedAt: '2026-03-15 09:45' },
  { id: 'REV-3', module: 'treatment_uploads', subject: 'TR-2033', details: 'Before/after photos uploaded by staff', submittedAt: '2026-03-15 10:30' },
  { id: 'REV-4', module: 'profile_updates', subject: 'Mina Santos', details: 'Updated allergy and medication list', submittedAt: '2026-03-15 11:05' },
]

const tabs: { key: ReviewTab; label: string }[] = [
  { key: 'appointments', label: 'Appointments' },
  { key: 'registrations', label: 'Registrations' },
  { key: 'treatment_uploads', label: 'Treatment Uploads' },
  { key: 'profile_updates', label: 'Profile Updates' },
]

export function AdminReviewPage() {
  const [activeTab, setActiveTab] = useState<ReviewTab>('appointments')
  const [resolution, setResolution] = useState<Record<string, string>>({})

  const filteredItems = useMemo(() => pendingItems.filter((item) => item.module === activeTab), [activeTab])

  return (
    <AdminShell>
      <div className='flex items-center justify-between'>
        <h1 className='font-serif text-6xl text-[#4a2a00]'>Admin Review Center</h1>
        <button
          className='portal-btn-small'
          onClick={() =>
            exportCsv('review-report.csv', [
              ['id', 'module', 'subject', 'details', 'submitted_at'],
              ...filteredItems.map((item) => [item.id, item.module, item.subject, item.details, item.submittedAt]),
            ])
          }
        >
          EXPORT REVIEW CSV
        </button>
      </div>

      <div className='mt-6 flex flex-wrap gap-2'>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 ${activeTab === tab.key ? 'bg-[#5b2d04] text-[#f5e7d5]' : 'bg-[#eadfce] text-[#4a2a00]'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className='mt-5 space-y-3'>
        {filteredItems.map((item) => (
          <article key={item.id} className='rounded-md border border-[#8a5a2f]/30 bg-[#f8f2e9] p-4 text-[#4a2a00]'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-semibold'>{item.subject}</p>
                <p className='text-sm'>{item.details}</p>
                <p className='text-xs text-[#6f4520]'>Submitted: {item.submittedAt}</p>
              </div>
              <div className='flex gap-2'>
                <button className='portal-btn-small' onClick={() => setResolution((prev) => ({ ...prev, [item.id]: 'Approved' }))}>Approve</button>
                <button className='border border-[#8a5a2f]/45 px-3 py-2' onClick={() => setResolution((prev) => ({ ...prev, [item.id]: 'Rejected' }))}>Reject</button>
                <button className='border border-[#8a5a2f]/45 px-3 py-2' onClick={() => setResolution((prev) => ({ ...prev, [item.id]: 'More info requested' }))}>Request More Info</button>
              </div>
            </div>
            {resolution[item.id] ? <p className='mt-2 text-sm'>Action: {resolution[item.id]}</p> : null}
          </article>
        ))}
      </div>
    </AdminShell>
  )
}
