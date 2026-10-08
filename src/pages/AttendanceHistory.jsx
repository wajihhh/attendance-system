import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import AttendanceTable from '../components/AttendanceTable'

export default function AttendanceHistory() {
  const currentUser = useSelector((state) => state.auth.currentUser)
  const records = useSelector((state) => state.attendance.records)

  const userRecords = useMemo(
    () =>
      records
        .filter((record) => record.userId === currentUser.id)
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [records, currentUser.id],
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Attendance history</h2>
        <p className="mt-1 text-slate-500">All check-in and check-out records for your account.</p>
      </div>
      <AttendanceTable records={userRecords} />
    </div>
  )
}
