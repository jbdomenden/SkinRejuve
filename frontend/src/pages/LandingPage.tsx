import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <main className='mx-auto max-w-4xl p-8'>
      <h1 className='text-3xl font-bold'>Skin Rejuve Clinic Portal</h1>
      <p className='mt-2 text-gray-600'>Patient and staff management platform.</p>
      <div className='mt-6 flex gap-4'>
        <Link to='/login' className='rounded bg-black px-4 py-2 text-white'>Login</Link>
        <Link to='/register' className='rounded border px-4 py-2'>Register</Link>
      </div>
    </main>
  )
}
