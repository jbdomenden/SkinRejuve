import { axios } from './axios'

export const appointmentApi = {
  history: () => axios.get('/api/appointments/history'),
  book: (payload: { serviceId: string; slotId: string }) => axios.post('/api/appointments', payload),
}
