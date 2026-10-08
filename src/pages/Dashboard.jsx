import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CalendarView from '../components/CalendarView'
import WeeklyHoursCard from '../components/WeeklyHoursCard'
import {
  formatHoursAndMinutes,
  formatTime,
  getRecordHours,
  getWeekStart,
  getWeeklyHours,
  toISODate,
} from '../utils/dateUtils'
import { handleCheckOut } from '../utils/attendanceSession'

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const currentUser = useSelector((state) => state.auth.currentUser)
  const records = useSelector((state) => state.attendance.records)
  const leaves = useSelector((state) => state.leave.requests)

  const [now, setNow] = useState(() => new Date())

  // Keep live elapsed time updated
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  const today = toISODate(now)
  const userRecords = records.filter((record) => record.userId === currentUser.id)
  const todayRecord = userRecords.find((record) => record.date === today)
  const weekHours = getWeeklyHours(userRecords, getWeekStart(now), now)
  const todayHours = getRecordHours(todayRecord, now)

  const isCheckedIn = !!todayRecord && !todayRecord.checkOut

  const onCheckOut = () => {
    handleCheckOut(dispatch, currentUser.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Welcome, {currentUser.name}
          </h2>
          <p className="mt-1 text-slate-500">Here is your attendance snapshot for today.</p>
        </div>

        {isCheckedIn && (
          <button
            type="button"
            onClick={onCheckOut}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-red-600 active:scale-95 transition-all"
          >
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            Check Out
          </button>
        )}

        {todayRecord && !isCheckedIn && (
          <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700">
            ✓ Checked out for today
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's check-in" value={formatTime(todayRecord?.checkIn)} />
        <StatCard label="Today's check-out" value={formatTime(todayRecord?.checkOut)} />
        <StatCard label="Today's working hours" value={formatHoursAndMinutes(todayHours)} />
        <StatCard
          label="Attendance status"
          value={todayRecord ? todayRecord.status : 'Not checked in'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <WeeklyHoursCard hours={weekHours} />
        <div className="lg:col-span-2">
          <CalendarView records={records} leaves={leaves} userId={currentUser.id} />
        </div>
      </div>
    </div>
  )
}
