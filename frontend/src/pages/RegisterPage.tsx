import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { authApi } from '@/api/authApi'
import { AuthShell } from '@/components/layout'

const schema = z
  .object({
    fullName: z.string().min(2),
    username: z.string().min(3),
    email: z.string().email(),
    phone: z.string().min(7),
    dob: z.string().min(4),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords must match' })

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const form = useForm<FormData>({ resolver: zodResolver(schema) })
  const register = useMutation({ mutationFn: (v: FormData) => authApi.register({ email: v.email, password: v.password }) })

  return (
    <AuthShell>
      <div className='mx-auto max-w-3xl'>
        <div className='mb-8 flex justify-center border-b border-gold/40 pb-2 text-4xl text-ivory'>
          <Link to='/login' className='w-1/2 text-center text-ivory/85'>SIGN IN</Link>
          <span className='w-1/2 border-b-2 border-ivory pb-2 text-center'>NEW CLIENT</span>
        </div>

        <form className='space-y-4' onSubmit={form.handleSubmit((v) => register.mutate(v))}>
          <div className='grid grid-cols-2 gap-4'>
            <input className='portal-input' placeholder='FULLNAME' {...form.register('fullName')} />
            <input className='portal-input' placeholder='USERNAME' {...form.register('username')} />
          </div>
          <input className='portal-input' placeholder='EMAIL ADDRESS' {...form.register('email')} />
          <input className='portal-input' placeholder='PHONE NUMBER' {...form.register('phone')} />
          <input className='portal-input' placeholder='DATE OF BIRTH' {...form.register('dob')} />
          <input className='portal-input' type='password' placeholder='ENTER PASSWORD' {...form.register('password')} />
          <input className='portal-input' type='password' placeholder='CONFIRM PASSWORD' {...form.register('confirmPassword')} />

          <button className='portal-btn mx-auto block w-[58%]' type='submit'>
            NEXT
          </button>
        </form>
      </div>
    </AuthShell>
  )
}
