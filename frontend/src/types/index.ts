export type TreatmentProgressPhoto = {
  id: string
  kind: 'before' | 'after'
  url: string
  capturedAt: string
}

export type TreatmentRecordMediaRef = {
  recordId: string
  patientId: string
  patientName: string
  treatmentName: string
  sessionDate: string
  staffName: string
  notes: string
  photos: TreatmentProgressPhoto[]
}

export type TreatmentRecordFilters = {
  treatment?: string
  fromDate?: string
  toDate?: string
}
