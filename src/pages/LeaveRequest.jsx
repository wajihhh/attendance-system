import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { formatDisplayDate } from '../utils/dateUtils'
import { submitLeave } from '../utils/attendanceSession'

export default function LeaveRequest() {
  const dispatch = useDispatch()
  const currentUser = useSelector((state) => state.auth.currentUser)
  const requests = useSelector((state) => state.leave.requests)
  const [leaveDate, setLeaveDate] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')

  const myLeaves = requests
    .filter((leave) => leave.userId === currentUser.id)
    .slice()
    .sort((a, b) => (a.leaveDate < b.leaveDate ? 1 : -1))

  const onSubmit = (event) => {
    event.preventDefault()
    if (!leaveDate || !reason.trim()) return
    submitLeave(dispatch, {
      userId: currentUser.id,
      leaveDate,
      reason,
    })
    setReason('')
    setLeaveDate('')
    setMessage('Leave request submitted. Awaiting admin approval.')
  }

  const statusClass = (status) => {
    const map = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    }
    return map[status] ?? 'bg-slate-100 text-slate-600'
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Leave request</h2>
        <p className="mt-1 text-sm text-slate-500">Your request will be reviewed by admin.</p>
        {message && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {message}
          </p>
        )}
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Leave date
          <input
            type="date"
            required
            value={leaveDate}
            onChange={(event) => setLeaveDate(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Reason
          <textarea
            required
            rows={4}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500"
          />
        </label>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-500"
        >
          Submit leave
        </button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Your leaves</h3>
        <div className="mt-4 space-y-3">
          {myLeaves.length === 0 && (
            <p className="text-sm text-slate-500">No leave requests yet.</p>
          )}
          {myLeaves.map((leave) => (
            <div key={leave.id} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-800">{formatDisplayDate(leave.leaveDate)}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusClass(leave.status)}`}
                >
                  {leave.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{leave.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
