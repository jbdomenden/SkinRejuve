import { axios } from './axios'

export type LoginPayload = { email: string; password: string }
export type RegisterPayload = { email: string; password: string }

export const authApi = {
  register: (payload: RegisterPayload) => axios.post('/api/auth/register', payload),
  login: (payload: LoginPayload) => axios.post('/api/auth/login', payload),
  forgotPassword: (email: string) => axios.post('/api/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => axios.post('/api/auth/reset-password', { token, password }),
}
