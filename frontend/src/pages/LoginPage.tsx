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
        <div className='mb-8 flex justify-center gap-16 border-b border-gold/50 pb-2 text-4xl text-ivory'>
          <span className='border-b-2 border-ivory pb-2'>SIGN IN</span>
          <Link to='/register' className='text-ivory/85'>NEW CLIENT</Link>
        </div>

        <form className='space-y-5' onSubmit={form.handleSubmit((v) => login.mutate(v))}>
          <label className='block text-sm text-ivory'>USERNAME</label>
          <input className='portal-input' placeholder='email@example.com' {...form.register('email')} />
          <label className='block text-sm text-ivory'>PASSWORD</label>
          <input className='portal-input' type='password' placeholder='••••••••' {...form.register('password')} />

          <div className='text-right text-sm text-ivory underline'>
            <Link to='/forgot-password'>FORGOT PASSWORD?</Link>
          </div>

          <button className='portal-btn w-full' type='submit'>
            ENTER PORTAL
          </button>
        </form>
      </div>
    </AuthShell>
  )
}
