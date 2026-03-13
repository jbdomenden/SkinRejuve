import { PortalShell } from '@/components/layout'

const records = [
  { service: 'SKIN TREATMENT', date: 'MARCH 3, 2026', status: 'PENDING', email: 'SAMPLE@GMAIL.COM' },
  { service: 'FACIAL TREATMENT', date: 'MARCH 4, 2026', status: 'IN PROGRESS', email: 'CARMELO@GMAIL.COM' },
]

export function DashboardPage() {
  return (
    <PortalShell>
      <h1 className='font-serif text-8xl text-ivory'>USER DASHBOARD</h1>

      <div className='mt-6 grid grid-cols-4 gap-6'>
        {['TOTAL RECORD\n1', 'COMPLETED APPT.\n0', 'DENIED APPT.\n0', 'PENDING APPT.\n1'].map((x) => (
          <div key={x} className='rounded-md border-2 border-ivory/60 bg-brand p-5 text-ivory'>
            {x.split('\n').map((l) => (
              <div key={l} className='font-serif text-5xl'>{l}</div>
            ))}
          </div>
        ))}
      </div>

      <div className='mt-8 rounded-sm bg-paper p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='font-serif text-6xl text-brand'>STATUS OF INQUIRY</h2>
          <div className='flex gap-3'>
            <input className='border border-brand/30 bg-white px-4 py-2' placeholder='Search Record/s' />
            <button className='bg-tan px-6 py-2 text-white'>FILTER</button>
            <button className='bg-tan px-6 py-2 text-white'>+ Add More Appt.</button>
          </div>
        </div>

        <table className='w-full text-left text-brand'>
          <thead className='bg-paper-dark text-5xl font-semibold'>
            <tr>
              <th className='p-3'>SERVICES</th>
              <th className='p-3'>DATE</th>
              <th className='p-3'>STATUS</th>
              <th className='p-3'>EMAIL</th>
              <th className='p-3'>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr className='border-b border-brand/20 text-4xl' key={`${r.service}-${r.date}`}>
                <td className='p-3'>{r.service}</td>
                <td className='p-3'>{r.date}</td>
                <td className='p-3'>{r.status}</td>
                <td className='p-3'>{r.email}</td>
                <td className='p-3'><button className='bg-tan px-6 py-1 text-white'>VIEW</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalShell>
  )
}
