import { axios } from './axios'

export const patientApi = {
  profile: () => axios.get('/api/patient/profile'),
  saveProfile: (payload: unknown) => axios.post('/api/patient/profile', payload),
  saveIntake: (payload: unknown) => axios.post('/api/patient/intake', payload),
}
