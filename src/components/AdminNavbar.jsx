import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout } from '../features/auth/authSlice'

const LINKS = [
  { to: '/admin/dashboard', label: '📊 Dashboard' },
  { to: '/admin/users', label: '👥 Users' },
  { to: '/admin/attendance', label: '🕐 Attendance' },
  { to: '/admin/leaves', label: '📋 Leave Requests' },
]

export default function AdminNavbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.auth.currentUser)
  const [open, setOpen] = useState(false)

  const onLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
      isActive
        ? 'bg-violet-600 text-white'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {/* Sidebar */}
      <aside
        className={`${
          open ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 z-30 w-64 bg-slate-900 p-4 transition-transform lg:static lg:translate-x-0`}
      >
        <div className="mb-8 px-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
            HRMS
          </p>
          <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
          <p className="mt-1 text-xs text-slate-400">{currentUser?.email}</p>
        </div>

        <nav className="space-y-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={onLogout}
          className="mt-8 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-red-600 hover:text-white"
        >
          Logout
        </button>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm lg:hidden"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString([], {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
              Admin
            </span>
            <p className="text-sm font-medium text-slate-800">{currentUser?.name}</p>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
