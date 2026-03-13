import { useEffect, useMemo, useState } from 'react'
import { PortalShell } from '@/components/layout'
import { treatmentRecordsApi } from '@/api/treatmentRecordsApi'
import { TreatmentRecordMediaRef } from '@/types'

export function HistoryPage() {
  const [records, setRecords] = useState<TreatmentRecordMediaRef[]>([])
  const [treatment, setTreatment] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selected, setSelected] = useState<TreatmentRecordMediaRef | null>(null)

  useEffect(() => {
    treatmentRecordsApi.listProgressRecords().then(setRecords)
  }, [])

  const filtered = useMemo(() => {
    return records.filter((item) => {
      if (treatment && item.treatmentName !== treatment) return false
      if (fromDate && item.sessionDate < fromDate) return false
      if (toDate && item.sessionDate > toDate) return false
      return true
    })
  }, [fromDate, records, toDate, treatment])

  const treatmentOptions = useMemo(() => Array.from(new Set(records.map((item) => item.treatmentName))), [records])

  return (
    <PortalShell>
      <h1 className='font-serif text-7xl text-ivory'>Patient Progress History</h1>

      <div className='mt-6 rounded bg-paper p-5 text-brand'>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-4'>
          <select className='portal-input' value={treatment} onChange={(e) => setTreatment(e.target.value)}>
            <option value=''>All treatments</option>
            {treatmentOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
          <input className='portal-input' type='date' value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <input className='portal-input' type='date' value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <button className='portal-btn' onClick={() => { setTreatment(''); setFromDate(''); setToDate('') }}>RESET FILTERS</button>
        </div>

        <div className='mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2'>
          {filtered.map((record) => (
            <article key={record.recordId} className='rounded border border-brand/20 bg-white p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-serif text-3xl'>{record.treatmentName}</p>
                  <p className='text-sm'>{record.sessionDate} • {record.staffName}</p>
                </div>
                <button className='portal-btn-small' onClick={() => setSelected(record)}>COMPARE PHOTOS</button>
              </div>
              <p className='mt-3 text-sm'>{record.notes}</p>
            </article>
          ))}
        </div>
      </div>

      {selected ? (
        <div className='fixed inset-0 z-40 grid place-items-center bg-black/60 p-6'>
          <div className='w-full max-w-5xl rounded bg-paper p-6 text-brand'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='font-serif text-5xl'>{selected.treatmentName} • Before / After</h2>
              <button className='portal-btn-small' onClick={() => setSelected(null)}>CLOSE</button>
            </div>
            <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
              {selected.photos.map((photo) => (
                <figure key={photo.id}>
                  <figcaption className='mb-2 text-sm uppercase tracking-[0.12em]'>{photo.kind}</figcaption>
                  <img alt={`${selected.treatmentName} ${photo.kind}`} className='h-[300px] w-full rounded object-cover' src={photo.url} />
                </figure>
              ))}
            </div>
            <p className='mt-4 text-sm'>{selected.notes}</p>
          </div>
        </div>
      ) : null}
    </PortalShell>
  )
}
