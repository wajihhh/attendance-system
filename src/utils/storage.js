const STORAGE_KEY = 'attendance-hrms-state'

/** Load persisted Redux slices from LocalStorage. */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const parsed = JSON.parse(raw)
    return {
      auth: parsed.auth,
      attendance: parsed.attendance,
      leave: parsed.leave,
    }
  } catch {
    return undefined
  }
}

/** Persist auth, attendance, and leave slices. */
export function saveState(state) {
  try {
    const snapshot = {
      auth: state.auth,
      attendance: state.attendance,
      leave: state.leave,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // Ignore quota / private-mode failures.
  }
}
