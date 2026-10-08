import { configureStore } from '@reduxjs/toolkit'
import authReducer, { setUsers } from '../features/auth/authSlice'
import attendanceReducer, { setRecords } from '../features/attendance/attendanceSlice'
import leaveReducer, { setRequests } from '../features/leave/leaveSlice'
import { loadState, saveState } from '../utils/storage'
import { restoreSessionCheckIn } from '../utils/attendanceSession'

const store = configureStore({
  reducer: {
    auth: authReducer,
    attendance: attendanceReducer,
    leave: leaveReducer,
  },
  preloadedState: loadState(),
})

// Debounced LocalStorage persistence of Redux state.
let persistTimer
store.subscribe(() => {
  clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    saveState(store.getState())
  }, 150)
})

// Cross-tab synchronization via localStorage storage event
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'attendance-hrms-state') {
      const fresh = loadState()
      if (fresh) {
        if (fresh.attendance?.records) {
          store.dispatch(setRecords(fresh.attendance.records))
        }
        if (fresh.leave?.requests) {
          store.dispatch(setRequests(fresh.leave.requests))
        }
        if (fresh.auth?.users) {
          store.dispatch(setUsers(fresh.auth.users))
        }
      }
    }
  })
}

restoreSessionCheckIn(store)
saveState(store.getState())

export default store
