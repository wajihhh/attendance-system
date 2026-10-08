import { REQUIRED_WEEKLY_HOURS, formatHoursAndMinutes, weeklyStatus } from '../utils/dateUtils'

export default function WeeklyHoursCard({ hours }) {
  const safeHours = Number(hours) || 0
  const status = weeklyStatus(safeHours)
  const completed = status === 'Completed'
  const percent = Math.min(100, Math.round((safeHours / REQUIRED_WEEKLY_HOURS) * 100))

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">Weekly hours</p>
      <p className={`mt-2 text-3xl font-semibold ${completed ? 'text-emerald-600' : 'text-red-600'}`}>
        {formatHoursAndMinutes(safeHours)}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        of {REQUIRED_WEEKLY_HOURS}h required this week
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${completed ? 'bg-emerald-500' : 'bg-red-500'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p
        className={`mt-3 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          completed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}
      >
        {status}
      </p>
    </div>
  )
}
