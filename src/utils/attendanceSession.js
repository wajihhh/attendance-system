import { checkIn, checkOut } from '../features/attendance/attendanceSlice'
import { logout } from '../features/auth/authSlice'
import { addLeave } from '../features/leave/leaveSlice'
import { toISODate } from './dateUtils'

export function handleSuccessfulLogin(dispatch, userId) {
  dispatch(checkIn({ userId }))
}

/** Logout only — does NOT check out. User must click Check Out separately. */
export function handleLogout(dispatch) {
  dispatch(logout())
}

/** Explicit check-out triggered by the Check Out button. */
export function handleCheckOut(dispatch, userId) {
  dispatch(checkOut({ userId }))
}

export function submitLeave(dispatch, payload) {
  dispatch(addLeave(payload))
}

/** If a persisted session has no record for today, check in once. */
export function restoreSessionCheckIn(store) {
  const state = store.getState()
  const user = state.auth?.currentUser
  if (!user || user.isAdmin) return

  const today = toISODate()
  const hasToday = state.attendance?.records?.some(
    (record) => record.userId === user.id && record.date === today,
  )
  if (!hasToday) {
    store.dispatch(checkIn({ userId: user.id }))
  }
}
