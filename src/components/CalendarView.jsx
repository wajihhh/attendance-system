import { useMemo, useState } from 'react'
import {
  classifyCalendarDay,
  getMonthGrid,
  toISODate,
} from '../utils/dateUtils'

const LEGEND = [
  { key: 'complete', label: 'Shift complete (≥9h)', className: 'bg-emerald-500' },
  { key: 'incomplete', label: 'Shift incomplete (<9h)', className: 'bg-red-500' },
  { key: 'active', label: 'Currently checked in', className: 'bg-amber-400' },
  { key: 'leave', label: 'Approved leave', className: 'bg-slate-400' },
  { key: 'absent', label: 'Absent', className: 'bg-slate-950' },
]

const DAY_STYLES = {
  complete: 'bg-emerald-500 text-white',
  incomplete: 'bg-red-500 text-white',
  active: 'bg-amber-400 text-white',
  leave: 'bg-slate-400 text-white',
  absent: 'bg-slate-950 text-white',
  empty: 'bg-white text-slate-700 border border-slate-200',
}

export default function CalendarView({ records, leaves, userId }) {
  const today = new Date()
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  const userRecords = useMemo(
    () => records.filter((r) => r.userId === userId),
    [records, userId],
  )

  const userLeaves = useMemo(
    () => leaves.filter((l) => l.userId === userId && l.status === 'approved'),
    [leaves, userId],
  )

  // Map of date string → record object for O(1) lookup
  const recordsByDate = useMemo(() => {
    const map = {}
    userRecords.forEach((r) => { map[r.date] = r })
    return map
  }, [userRecords])

  const leaveDates = useMemo(
    () => new Set(userLeaves.map((l) => l.leaveDate)),
    [userLeaves],
  )

  const cells = getMonthGrid(cursor.getFullYear(), cursor.getMonth())
  const title = cursor.toLocaleDateString([], { month: 'long', year: 'numeric' })

  const shiftMonth = (delta) =>
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">Attendance calendar</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm hover:bg-slate-50"
          >
            Prev
          </button>
          <span className="min-w-36 text-center text-sm font-medium text-slate-700">{title}</span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
          <div key={label} className="py-1">{label}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="h-10" />

          const kind = classifyCalendarDay({ date, today, leaveDates, recordsByDate })
          const isToday = toISODate(date) === toISODate(today)

          return (
            <div
              key={toISODate(date)}
              className={`flex h-10 items-center justify-center rounded-lg text-sm font-medium ${DAY_STYLES[kind]} ${
                isToday ? 'ring-2 ring-indigo-500 ring-offset-1' : ''
              }`}
            >
              {date.getDate()}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
        {LEGEND.map((item) => (
          <span key={item.key} className="inline-flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-sm ${item.className}`} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
