import Axios from 'axios'
import { API_BASE_URL } from '@/lib/constants'

export const axios = Axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
})
