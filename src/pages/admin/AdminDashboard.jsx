import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { formatHoursAndMinutes, getRecordHours, toISODate } from '../../utils/dateUtils'

export default function AdminDashboard() {
  const users = useSelector((state) => state.auth.users)
  const records = useSelector((state) => state.attendance.records)
  const leaves = useSelector((state) => state.leave.requests)

  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  const totalUsers = users.length
  const pendingLeaves = leaves.filter((l) => l.status === 'pending').length
  const approvedLeaves = leaves.filter((l) => l.status === 'approved').length

  // Today's active sessions
  const today = toISODate(now)
  const checkedInToday = records.filter(
    (r) => r.date === today && !r.checkOut,
  ).length

  const stats = [
    {
      label: 'Total Employees',
      value: totalUsers,
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      text: 'text-violet-700',
      icon: '👥',
    },
    {
      label: 'Checked In Today',
      value: checkedInToday,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: '✅',
    },
    {
      label: 'Pending Leaves',
      value: pendingLeaves,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: '⏳',
    },
    {
      label: 'Approved Leaves',
      value: approvedLeaves,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: '📋',
    },
  ]

  // Recent leave requests (last 5)
  const recentLeaves = [...leaves]
    .reverse()
    .slice(0, 5)
    .map((l) => {
      const user = users.find((u) => u.id === l.userId)
      return { ...l, userName: user?.name ?? 'Unknown' }
    })

  // Recent attendance (last 5)
  const recentAttendance = [...records]
    .reverse()
    .slice(0, 5)
    .map((r) => {
      const user = users.find((u) => u.id === r.userId)
      return { ...r, userName: user?.name ?? 'Unknown' }
    })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border ${s.border} ${s.bg} p-4`}
          >
            <p className="text-2xl">{s.icon}</p>
            <p className={`mt-2 text-3xl font-bold ${s.text}`}>{s.value}</p>
            <p className="mt-1 text-sm text-slate-600">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leave Requests */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Recent Leave Requests</h2>
          {recentLeaves.length === 0 ? (
            <p className="text-sm text-slate-400">No leave requests yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="pb-2">Employee</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLeaves.map((l) => (
                  <tr key={l.id} className="border-b border-slate-50">
                    <td className="py-2 font-medium text-slate-800">{l.userName}</td>
                    <td className="py-2 text-slate-500">{l.leaveDate}</td>
                    <td className="py-2">
                      <StatusBadge status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Attendance */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-slate-800">Recent Attendance</h2>
          {recentAttendance.length === 0 ? (
            <p className="text-sm text-slate-400">No attendance records yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="pb-2">Employee</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((r) => {
                  const recHours = getRecordHours(r, now)
                  return (
                    <tr key={r.id} className="border-b border-slate-50">
                      <td className="py-2 font-medium text-slate-800">{r.userName}</td>
                      <td className="py-2 text-slate-500">{r.date}</td>
                      <td className="py-2 text-slate-700">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span>{formatHoursAndMinutes(recHours)}</span>
                          {!r.checkOut && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                              Active
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
        map[status] ?? 'bg-slate-100 text-slate-600'
      }`}
    >
      {status}
    </span>
  )
}
