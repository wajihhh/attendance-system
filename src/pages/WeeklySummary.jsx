import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import CalendarView from '../components/CalendarView'
import WeeklyHoursCard from '../components/WeeklyHoursCard'
import {
  formatDisplayDate,
  getWeekEnd,
  getWeekStart,
  getWeeklyHours,
  REQUIRED_WEEKLY_HOURS,
  toISODate,
} from '../utils/dateUtils'

export default function WeeklySummary() {
  const currentUser = useSelector((state) => state.auth.currentUser)
  const records = useSelector((state) => state.attendance.records)
  const leaves = useSelector((state) => state.leave.requests)

  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  const userRecords = records.filter((record) => record.userId === currentUser.id)
  const weekStart = getWeekStart(now)
  const weekEnd = getWeekEnd(weekStart)
  const hours = getWeeklyHours(userRecords, weekStart, now)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Weekly summary</h2>
        <p className="mt-1 text-slate-500">
          {formatDisplayDate(toISODate(weekStart))} – {formatDisplayDate(toISODate(weekEnd))} ·{' '}
          {REQUIRED_WEEKLY_HOURS} hours required
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <WeeklyHoursCard hours={hours} />
        <div className="lg:col-span-2">
          <CalendarView records={records} leaves={leaves} userId={currentUser.id} />
        </div>
      </div>
    </div>
  )
}
