import { createSlice, nanoid } from '@reduxjs/toolkit'
import { diffHours, toISODate } from '../../utils/dateUtils'

const initialState = {
  records: [],
}

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    // One check-in per user per calendar day.
    checkIn(state, action) {
      const { userId, now } = action.payload
      const at = now ? new Date(now) : new Date()
      const date = toISODate(at)
      const exists = state.records.some(
        (record) => record.userId === userId && record.date === date,
      )
      if (exists) return

      state.records.push({
        id: nanoid(),
        userId,
        date,
        checkIn: at.toISOString(),
        checkOut: null,
        totalHours: 0,
        status: 'Checked In',
      })
    },
    checkOut(state, action) {
      const { userId, now } = action.payload
      const at = now ? new Date(now) : new Date()
      const date = toISODate(at)
      const record = state.records.find(
        (entry) => entry.userId === userId && entry.date === date,
      )
      if (!record || record.checkOut) return

      record.checkOut = at.toISOString()
      record.totalHours = diffHours(record.checkIn, record.checkOut)
      record.status = 'Completed'
    },
    calculateHours(state, action) {
      const { recordId, checkOut } = action.payload
      const record = state.records.find((entry) => entry.id === recordId)
      if (!record) return
      const end = checkOut || record.checkOut || new Date().toISOString()
      record.totalHours = diffHours(record.checkIn, end)
    },
    // Admin: edit check-in / check-out times for any record
    editAttendance(state, action) {
      const { recordId, checkIn, checkOut } = action.payload
      const record = state.records.find((entry) => entry.id === recordId)
      if (!record) return
      if (checkIn) record.checkIn = new Date(checkIn).toISOString()
      if (checkOut) {
        record.checkOut = new Date(checkOut).toISOString()
        record.totalHours = diffHours(record.checkIn, record.checkOut)
        record.status = 'Completed'
      } else {
        record.checkOut = null
        record.totalHours = 0
        record.status = 'Checked In'
      }
    },
    setRecords(state, action) {
      state.records = action.payload || []
    },
  },
})

export const { checkIn, checkOut, calculateHours, editAttendance, setRecords } =
  attendanceSlice.actions
export default attendanceSlice.reducer
