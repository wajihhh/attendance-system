import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { approveLeave, rejectLeave } from '../../features/leave/leaveSlice'

export default function AdminLeaves() {
  const dispatch = useDispatch()
  const users = useSelector((state) => state.auth.users)
  const leaves = useSelector((state) => state.leave.requests)

  const [filter, setFilter] = useState('all')

  const enriched = leaves
    .map((l) => {
      const user = users.find((u) => u.id === l.userId)
      return { ...l, userName: user?.name ?? 'Unknown', userEmail: user?.email ?? '' }
    })
    .filter((l) => filter === 'all' || l.status === filter)
    .sort((a, b) => b.leaveDate.localeCompare(a.leaveDate))

  const counts = {
    all: leaves.length,
    pending: leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  }

  const tabs = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'approved', label: 'Approved', count: counts.approved },
    { key: 'rejected', label: 'Rejected', count: counts.rejected },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Leave Requests</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-violet-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                filter === tab.key ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Leave Date</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {enriched.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No leave requests found.
                </td>
              </tr>
            ) : (
              enriched.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{l.userName}</td>
                  <td className="px-4 py-3 text-slate-500">{l.userEmail}</td>
                  <td className="px-4 py-3 text-slate-700">{l.leaveDate}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-slate-600" title={l.reason}>
                    {l.reason}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-4 py-3">
                    {l.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => dispatch(approveLeave(l.id))}
                          className="rounded bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-200"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => dispatch(rejectLeave(l.id))}
                          className="rounded bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    ) : l.status === 'approved' ? (
                      <button
                        onClick={() => dispatch(rejectLeave(l.id))}
                        className="rounded bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200"
                      >
                        ✕ Reject
                      </button>
                    ) : (
                      <button
                        onClick={() => dispatch(approveLeave(l.id))}
                        className="rounded bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-200"
                      >
                        ✓ Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
