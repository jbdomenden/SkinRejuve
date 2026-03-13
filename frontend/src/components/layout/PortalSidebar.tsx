import { Link, useLocation } from 'react-router-dom'

const items = [
  { to: '/dashboard', label: 'HOME', icon: '⌂' },
  { to: '/services', label: 'APPOINTMENT', icon: '🗓' },
  { to: '/history', label: 'HISTORY', icon: '↺' },
  { to: '/account', label: 'ACCOUNT', icon: '⚙' },
]

export function PortalSidebar() {
  const location = useLocation()
  return (
    <aside className='w-[320px] shrink-0 bg-brand px-10 py-8 text-ivory'>
      <div className='font-serif text-6xl leading-none'>SKIN REJUVE</div>
      <div className='mt-2 border-t border-gold/40 pt-2 text-xs tracking-[0.5em]'>SINCE 2011</div>

      <nav className='mt-10 space-y-3'>
        {items.map((item) => {
          const active = location.pathname === item.to
          return (
            <Link
              key={item.to}
              className={`flex items-center gap-4 px-4 py-4 text-3xl ${active ? 'bg-paper text-brand' : 'text-ivory'}`}
              to={item.to}
            >
              <span>{item.icon}</span>
              <span className='text-xl'>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className='mt-16 border-t border-gold/30 pt-6 text-2xl'>
        <div className='font-semibold'>Carmelo John Cruz</div>
        <div className='text-lg text-ivory/80'>Patient</div>
      </div>
    </aside>
  )
}
