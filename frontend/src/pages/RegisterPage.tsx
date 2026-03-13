import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { authApi } from '@/api/authApi'

const schema = z.object({ email: z.string().email(), password: z.string().min(8) })
type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const form = useForm<FormData>({ resolver: zodResolver(schema) })
  const register = useMutation({ mutationFn: authApi.register })

  return (
    <main className='mx-auto max-w-md p-8'>
      <h1 className='text-2xl font-semibold'>Register</h1>
      <form className='mt-4 space-y-3' onSubmit={form.handleSubmit((v) => register.mutate(v))}>
        <input className='w-full rounded border p-2' placeholder='Email' {...form.register('email')} />
        <input className='w-full rounded border p-2' type='password' placeholder='Password' {...form.register('password')} />
        <button className='rounded bg-black px-4 py-2 text-white' type='submit'>Create account</button>
      </form>
    </main>
  )
}
