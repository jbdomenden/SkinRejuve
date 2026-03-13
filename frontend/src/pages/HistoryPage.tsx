import { PortalShell } from '@/components/layout'

export function HistoryPage() {
  return (
    <PortalShell>
      <h1 className='font-serif text-8xl text-ivory'>Patient’s Medical Transaction History</h1>
      <div className='mt-6 rounded bg-paper p-6'>
        <h2 className='font-serif text-6xl text-brand'>STATUS OF INQUIRY</h2>
        <table className='mt-4 w-full text-left text-brand'>
          <thead className='bg-paper-dark text-5xl'>
            <tr><th className='p-3'>SERVICES</th><th className='p-3'>DATE</th><th className='p-3'>STATUS</th><th className='p-3'>EMAIL</th><th className='p-3'>ACTION</th></tr>
          </thead>
          <tbody className='text-4xl'>
            <tr className='border-b border-brand/20'><td className='p-3'>LAZER TREATMENT</td><td>MARCH 3, 2026</td><td>DONE</td><td>SAMPLE@GMAIL.COM</td><td><button className='bg-tan px-5 py-1 text-white'>VIEW</button></td></tr>
            <tr><td className='p-3'>LAZER TREATMENT</td><td>APRIL 4, 2026</td><td>DONE</td><td>SAMPLE@GMAIL.COM</td><td><button className='bg-tan px-5 py-1 text-white'>VIEW</button></td></tr>
          </tbody>
        </table>
      </div>
    </PortalShell>
  )
}
