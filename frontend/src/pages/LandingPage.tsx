import { Link } from 'react-router-dom'
import { AuthShell } from '@/components/layout'

export function LandingPage() {
  return (
    <AuthShell>
      <div className='mx-auto max-w-xl text-center text-ivory'>
        <p className='text-2xl uppercase tracking-[0.25em]'>Welcome to</p>
        <h2 className='mt-2 font-serif text-7xl'>Skin Rejuve Clinic Portal</h2>
        <div className='mt-10 grid gap-3'>
          <Link to='/login' className='portal-btn'>SIGN IN</Link>
          <Link to='/register' className='portal-btn'>NEW CLIENT</Link>
          <Link to='/dashboard' className='portal-btn'>VIEW DASHBOARD MOCK</Link>
        </div>
      </div>
    </AuthShell>
  )
}
