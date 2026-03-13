import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { authApi } from '@/api/authApi'
import { AuthShell } from '@/components/layout'

const schema = z.object({ email: z.string().email(), password: z.string().min(8) })
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const form = useForm<FormData>({ resolver: zodResolver(schema) })
  const login = useMutation({ mutationFn: authApi.login })

  return (
    <AuthShell>
      <div className='mx-auto max-w-xl'>
        <div className='mb-10 flex justify-center border-b border-gold/40 pb-2 text-4xl text-ivory'>
          <span className='w-1/2 border-b-2 border-ivory pb-2 text-center'>SIGN IN</span>
          <Link to='/register' className='w-1/2 text-center text-ivory/85'>NEW CLIENT</Link>
        </div>

        <form className='space-y-4' onSubmit={form.handleSubmit((v) => login.mutate(v))}>
          <label className='block text-xs tracking-[0.08em] text-ivory'>USERNAME</label>
          <input className='portal-input' placeholder='' {...form.register('email')} />
          <label className='block text-xs tracking-[0.08em] text-ivory'>PASSWORD</label>
          <input className='portal-input' type='password' placeholder='' {...form.register('password')} />

          <div className='text-right text-sm text-ivory underline'>
            <Link to='/forgot-password'>FORGOT PASSWORD?</Link>
          </div>

          <label className='flex items-center gap-2 text-sm text-ivory/95'>
            <input type='checkbox' className='h-3 w-3 accent-[#a86a17]' />
            Remember me on this device
          </label>

          <button className='portal-btn mt-2 w-full' type='submit'>
            ENTER PORTAL
          </button>
        </form>
      </div>
    </AuthShell>
  )
}
