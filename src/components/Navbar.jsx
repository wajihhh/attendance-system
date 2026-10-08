import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { handleLogout } from '../utils/attendanceSession'

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/leave', label: 'Leave' },
  { to: '/weekly', label: 'Weekly Summary' },
]

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.auth.currentUser)
  const [open, setOpen] = useState(false)

  const onLogout = () => {
    handleLogout(dispatch)
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-sm font-medium ${
      isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside
        className={`${
          open ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 z-30 w-64 bg-slate-900 p-4 transition-transform lg:static lg:translate-x-0`}
      >
        <div className="mb-8 px-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">HRMS</p>
          <h1 className="text-lg font-semibold text-white">Attendance</h1>
        </div>
        <nav className="space-y-1">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setOpen(false)}>
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

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

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
          <p className="text-sm font-medium text-slate-800">{currentUser?.name}</p>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
