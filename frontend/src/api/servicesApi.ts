import { axios } from './axios'

export const servicesApi = {
  list: () => axios.get('/api/services'),
}
