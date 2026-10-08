import { formatDisplayDate, formatHoursAndMinutes, formatTime, getRecordHours } from '../utils/dateUtils'

export default function AttendanceTable({ records }) {
  if (!records.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        No attendance records yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Check In</th>
            <th className="px-4 py-3 font-semibold">Check Out</th>
            <th className="px-4 py-3 font-semibold">Total Time</th>
            <th className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-800">{formatDisplayDate(record.date)}</td>
              <td className="px-4 py-3">{formatTime(record.checkIn)}</td>
              <td className="px-4 py-3">{formatTime(record.checkOut)}</td>
              <td className="px-4 py-3 font-medium text-slate-900">
                <div className="flex items-center gap-1.5">
                  <span>{formatHoursAndMinutes(getRecordHours(record))}</span>
                  {!record.checkOut && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                      Active
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    record.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {record.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
