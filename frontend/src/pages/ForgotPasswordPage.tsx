import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { authApi } from '@/api/authApi'
import { AuthShell } from '@/components/layout'

const schema = z.object({ email: z.string().email() })

type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [done, setDone] = useState(false)
  const form = useForm<FormData>({ resolver: zodResolver(schema) })
  const forgot = useMutation({ mutationFn: (v: FormData) => authApi.forgotPassword(v.email), onSuccess: () => setDone(true) })

  return (
    <AuthShell>
      {done ? (
        <div className='mx-auto max-w-2xl rounded-3xl bg-brand-light p-10 text-center text-ivory'>
          <div className='mx-auto mb-4 w-fit rounded-full bg-gold px-5 py-3 text-3xl text-brand'>✓</div>
          <h2 className='font-serif text-6xl'>CHECK YOUR INBOX</h2>
          <p className='mt-4 text-xl text-ivory/90'>A password reset link has been dispatched to your email.</p>
        </div>
      ) : (
        <div className='mx-auto max-w-2xl text-ivory'>
          <h2 className='font-serif text-7xl leading-tight'>FORGOT YOUR PASSWORD?</h2>
          <p className='mt-6 text-xl text-ivory/90'>Enter your registered email and we will send a secure reset link.</p>
          <form className='mt-10 space-y-4' onSubmit={form.handleSubmit((v) => forgot.mutate(v))}>
            <label className='text-sm tracking-[0.2em]'>EMAIL ADDRESS</label>
            <input className='portal-input' placeholder='YOUR@EMAIL.COM' {...form.register('email')} />
            <button className='portal-btn w-full' type='submit'>SEND RESET LINK</button>
          </form>
        </div>
      )}
    </AuthShell>
  )
}
