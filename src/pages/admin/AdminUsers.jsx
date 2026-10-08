import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { formatHoursAndMinutes, getRecordHours, toISODate } from '../../utils/dateUtils'

const REQUIRED_DAILY_HOURS = 9

export default function AdminUsers() {
  const users = useSelector((state) => state.auth.users)
  const records = useSelector((state) => state.attendance.records)
  const leaves = useSelector((state) => state.leave.requests)

  const [now, setNow] = useState(() => new Date())

  // Keep live time ticking every 10s for active check-ins
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  // Use local date — NOT toISOString() which gives UTC and causes mismatch
  const today = toISODate(now)

  const enrichedUsers = users.map((user) => {
    const userRecords = records.filter((r) => r.userId === user.id)
    const todayRecord = userRecords.find((r) => r.date === today)
    const totalLeaves = leaves.filter(
      (l) => l.userId === user.id && l.status === 'approved',
    ).length
    const todayHours = todayRecord ? getRecordHours(todayRecord, now) : null
    const totalHoursAll = userRecords.reduce(
      (sum, r) => sum + getRecordHours(r, now),
      0,
    )

    let todayStatus = 'Absent'
    if (todayRecord) {
      if (!todayRecord.checkOut) {
        todayStatus = 'Checked In'
      } else if ((todayRecord.totalHours || todayHours) >= REQUIRED_DAILY_HOURS) {
        todayStatus = 'Complete'
      } else {
        todayStatus = 'Incomplete'
      }
    }

    return {
      ...user,
      todayStatus,
      todayHours,
      totalLeaves,
      totalHoursAll,
      totalDays: userRecords.length,
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">All Employees</h1>

      {enrichedUsers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400">
          No employees registered yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Today</th>
                <th className="px-4 py-3">Hours Today</th>
                <th className="px-4 py-3">Total Days</th>
                <th className="px-4 py-3">Total Hours</th>
                <th className="px-4 py-3">Approved Leaves</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrichedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-slate-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.todayStatus} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {user.todayHours !== null ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-900">
                          {formatHoursAndMinutes(user.todayHours)}
                        </span>
                        {user.todayStatus === 'Checked In' && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                            Active
                          </span>
                        )}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{user.totalDays}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {formatHoursAndMinutes(user.totalHoursAll)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{user.totalLeaves}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    'Checked In':  'bg-amber-100 text-amber-700',
    'Complete':    'bg-green-100 text-green-700',
    'Incomplete':  'bg-red-100 text-red-700',
    'Absent':      'bg-slate-100 text-slate-600',
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}
