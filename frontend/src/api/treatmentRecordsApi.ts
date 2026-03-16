import { TreatmentRecordFilters, TreatmentRecordMediaRef } from '@/types'

const mockTreatmentRecords: TreatmentRecordMediaRef[] = [
  {
    recordId: 'TR-2001',
    patientId: 'PT-001',
    patientName: 'Carmelo John Cruz',
    treatmentName: 'Acne Laser',
    sessionDate: '2026-03-01',
    staffName: 'Dr. Maria Tan',
    notes: 'Visible reduction in redness; continue post-care serum for 10 days.',
    photos: [
      { id: 'TR-2001-B', kind: 'before', url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=60', capturedAt: '2026-03-01' },
      { id: 'TR-2001-A', kind: 'after', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=60', capturedAt: '2026-03-01' },
    ],
  },
  {
    recordId: 'TR-2033',
    patientId: 'PT-001',
    patientName: 'Carmelo John Cruz',
    treatmentName: 'Hydra Facial',
    sessionDate: '2026-03-10',
    staffName: 'Dr. Elaine Cruz',
    notes: 'Skin texture improved; schedule follow-up maintenance in 14 days.',
    photos: [
      { id: 'TR-2033-B', kind: 'before', url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=900&q=60', capturedAt: '2026-03-10' },
      { id: 'TR-2033-A', kind: 'after', url: 'https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=900&q=60', capturedAt: '2026-03-10' },
    ],
  },
]

export const treatmentRecordsApi = {
  listProgressRecords: async (filters?: TreatmentRecordFilters): Promise<TreatmentRecordMediaRef[]> => {
    return mockTreatmentRecords.filter((item) => {
      if (filters?.treatment && item.treatmentName !== filters.treatment) return false
      if (filters?.fromDate && item.sessionDate < filters.fromDate) return false
      if (filters?.toDate && item.sessionDate > filters.toDate) return false
      return true
    })
  },
}
