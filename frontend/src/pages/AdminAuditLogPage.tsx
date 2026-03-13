import { AdminShell } from '@/components/layout/AdminShell'
import { exportCsv } from '@/lib/reports'

const logs = [
  'Admin approved appointment APT-1022',
  'Admin rejected registration for duplicate email',
  'Staff updated treatment record TR-230',
  'System sent password reset email to user',
]

export function AdminAuditLogPage() {
  return (
    <AdminShell>
      <div className='flex items-center justify-between'>
        <h1 className='font-serif text-6xl text-[#4a2a00]'>Audit Log</h1>
        <button
          className='portal-btn-small'
          onClick={() =>
            exportCsv('audit-log-report.csv', [
              ['event', 'timestamp'],
              ...logs.map((log, index) => [log, `2026-03-15 10:${index}0:00`]),
            ])
          }
        >
          EXPORT CSV
        </button>
      </div>

      <div className='mt-6 rounded-md border border-[#8a5a2f]/30 bg-[#f8f2e9] p-6'>
        <ol className='space-y-3'>
          {logs.map((log, index) => (
            <li key={log} className='flex gap-4 rounded bg-white/80 p-4 text-[#4a2a00]'>
              <span className='font-semibold text-[#8a5a2f]'>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <p>{log}</p>
                <p className='text-sm text-[#6f4520]'>2026-03-15 10:{index}0:00</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </AdminShell>
  )
}
