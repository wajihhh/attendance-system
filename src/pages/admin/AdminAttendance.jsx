import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { editAttendance } from '../../features/attendance/attendanceSlice'
import {
  formatHoursAndMinutes,
  formatTime,
  getRecordHours,
  getWeekEnd,
  getWeekStart,
  toISODate,
} from '../../utils/dateUtils'

const REQUIRED_DAILY_HOURS = 9

export default function AdminAttendance() {
  const dispatch = useDispatch()
  const users = useSelector((state) => state.auth.users)
  const records = useSelector((state) => state.attendance.records)

  const [now, setNow] = useState(() => new Date())
  const [filterUser, setFilterUser] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ checkIn: '', checkOut: '' })

  // Keep live elapsed time updated for active sessions
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  // Enrich records with user names
  const enriched = records
    .map((r) => {
      const user = users.find((u) => u.id === r.userId)
      return { ...r, userName: user?.name ?? 'Unknown', userEmail: user?.email ?? '' }
    })
    .filter((r) => {
      if (filterUser !== 'all' && r.userId !== filterUser) return false
      if (filterDate && r.date !== filterDate) return false
      return true
    })
    .sort((a, b) => b.date.localeCompare(a.date))

  // Weekly hours per user — use local date (toISODate) not UTC (toISOString)
  const weeklyHours = {}
  const weekStartISO = toISODate(getWeekStart(now))
  const weekEndISO = toISODate(getWeekEnd(getWeekStart(now)))

  records.forEach((r) => {
    if (r.date >= weekStartISO && r.date <= weekEndISO) {
      weeklyHours[r.userId] = (weeklyHours[r.userId] || 0) + getRecordHours(r, now)
    }
  })

  const startEdit = (record) => {
    setEditingId(record.id)
    // Convert ISO to datetime-local format
    const toLocal = (iso) => {
      if (!iso) return ''
      const d = new Date(iso)
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
      return d.toISOString().slice(0, 16)
    }
    setEditForm({
      checkIn: toLocal(record.checkIn),
      checkOut: toLocal(record.checkOut),
    })
  }

  const saveEdit = (recordId) => {
    dispatch(
      editAttendance({
        recordId,
        checkIn: editForm.checkIn || undefined,
        checkOut: editForm.checkOut || undefined,
      }),
    )
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Attendance Records</h1>
      </div>

      {/* Weekly Summary by user */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-slate-800">
          Weekly Hours (This Week: {weekStartISO} – {weekEndISO})
        </h2>
        {users.length === 0 ? (
          <p className="text-sm text-slate-400">No employees yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {users.map((user) => {
              const hrs = Math.round((weeklyHours[user.id] || 0) * 100) / 100
              const pct = Math.min((hrs / 40) * 100, 100)
              return (
                <div
                  key={user.id}
                  className="min-w-[180px] flex-1 rounded-lg border border-slate-100 bg-slate-50 p-3"
                >
                  <p className="font-medium text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-2 rounded-full ${hrs >= 40 ? 'bg-green-500' : 'bg-violet-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {formatHoursAndMinutes(hrs)} / 40h
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
        >
          <option value="all">All Employees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
        />
        {filterDate && (
          <button
            onClick={() => setFilterDate('')}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:border-red-300 hover:text-red-500"
          >
            Clear Date
          </button>
        )}
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Check In</th>
              <th className="px-4 py-3">Check Out</th>
              <th className="px-4 py-3">Total Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {enriched.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No records found.
                </td>
              </tr>
            ) : (
              enriched.map((r) => {
                const recHours = getRecordHours(r, now)
                return editingId === r.id ? (
                  <tr key={r.id} className="bg-violet-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.userName}</td>
                    <td className="px-4 py-3 text-slate-500">{r.date}</td>
                    <td className="px-4 py-3">
                      <input
                        type="datetime-local"
                        value={editForm.checkIn}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, checkIn: e.target.value }))
                        }
                        className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-violet-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="datetime-local"
                        value={editForm.checkOut}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, checkOut: e.target.value }))
                        }
                        className="rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-violet-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-600">—</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                        Editing
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(r.id)}
                          className="rounded bg-violet-600 px-2 py-1 text-xs font-medium text-white hover:bg-violet-500"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.userName}</td>
                    <td className="px-4 py-3 text-slate-500">{r.date}</td>
                    <td className="px-4 py-3 text-slate-700">{formatTime(r.checkIn)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatTime(r.checkOut)}</td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span>{formatHoursAndMinutes(recHours)}</span>
                        {!r.checkOut && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} hours={recHours} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => startEdit(r)}
                        className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-violet-100 hover:text-violet-700"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status, hours }) {
  // For completed records, colour by whether the shift met 9h
  if (status === 'Completed') {
    return hours >= REQUIRED_DAILY_HOURS ? (
      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
        Complete ✓
      </span>
    ) : (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
        Incomplete ({formatHoursAndMinutes(hours)})
      </span>
    )
  }
  // Checked In — still active
  if (status === 'Checked In') {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
        Active
      </span>
    )
  }
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
      {status}
    </span>
  )
}
