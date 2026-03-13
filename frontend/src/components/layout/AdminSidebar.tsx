import { Link, useLocation } from 'react-router-dom'

const items = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/admin/appointments', label: 'Appointments', icon: '🗓' },
  { to: '/admin/registration', label: 'Registration', icon: '🧾' },
  { to: '/admin/audit-log', label: 'Audit Log', icon: '🕒' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙' },
]

export function AdminSidebar() {
  const location = useLocation()

  return (
    <aside className='w-[305px] shrink-0 bg-[#5b2d04] px-7 py-7 text-[#f5e7d5]'>
      <div className='font-serif text-5xl leading-none'>SKIN</div>
      <div className='font-serif text-5xl leading-none'>REJUVE</div>
      <div className='mt-1 text-xs tracking-[0.45em] text-[#d9b98a]'>SINCE 2011</div>

      <nav className='mt-10 space-y-2'>
        {items.map((item) => {
          const active = location.pathname === item.to
          return (
            <Link
              key={item.to}
              className={`flex items-center gap-3 rounded-sm px-4 py-3 text-lg transition ${
                active ? 'bg-[#f2eadf] font-semibold text-[#5b2d04]' : 'text-[#f5e7d5] hover:bg-[#74401c]'
              }`}
              to={item.to}
            >
              <span className='text-xl'>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className='mt-10 border-t border-[#cfa36f]/40 pt-5'>
        <div className='text-lg font-semibold'>Maricel Tan</div>
        <div className='text-sm text-[#f5e7d5]/75'>ADMIN</div>
      </div>
    </aside>
  )
}
