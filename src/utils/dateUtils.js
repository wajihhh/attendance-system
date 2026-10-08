export const REQUIRED_WEEKLY_HOURS = 40

export function toISODate(date = new Date()) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDisplayDate(isoDate) {
  if (!isoDate) return '—'
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function diffHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  const ms = new Date(checkOut) - new Date(checkIn)
  return Math.max(0, ms / 36e5)
}

/** Formats a numeric hours value into complete "Xh Ym" format, e.g. "2h 30m" */
export function formatHoursAndMinutes(hours) {
  if (hours == null || isNaN(hours) || Number(hours) <= 0) return '0h 0m'
  const totalMinutes = Math.round(Number(hours) * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}h ${m}m`
}

/** Live or stored hours for a single attendance record. */
export function getRecordHours(record, now = new Date()) {
  if (!record) return 0
  if (record.checkOut) return Number(record.totalHours) || diffHours(record.checkIn, record.checkOut)
  const at = now instanceof Date ? now : new Date(now)
  return diffHours(record.checkIn, at.toISOString())
}

/** Monday as the start of the current week. */
export function getWeekStart(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  return d
}

export function getWeekEnd(weekStart) {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

export function isWeekend(date) {
  const day = new Date(date).getDay()
  return day === 0 || day === 6
}

export function getWeeklyHours(records, weekStart, now = new Date()) {
  const start = toISODate(weekStart)
  const end = toISODate(getWeekEnd(weekStart))
  return records.reduce((sum, record) => {
    if (record.date >= start && record.date <= end) {
      return sum + getRecordHours(record, now)
    }
    return sum
  }, 0)
}

export function weeklyStatus(hours) {
  return hours >= REQUIRED_WEEKLY_HOURS ? 'Completed' : 'Incomplete'
}

const REQUIRED_DAILY_HOURS = 9

/**
 * Calendar color rules (priority):
 * 1. Approved leave → grey
 * 2. Checked out + hours >= 9 → green (shift complete)
 * 3. Checked out + hours < 9  → red (shift incomplete)
 * 4. Checked in, not yet out  → amber (active session)
 * 5. Past weekday, no record  → black (absent)
 */
export function classifyCalendarDay({
  date,
  today,
  leaveDates,
  recordsByDate,
}) {
  const iso = toISODate(date)
  if (leaveDates.has(iso)) return 'leave'

  const record = recordsByDate[iso]
  if (record) {
    if (record.checkOut) {
      return record.totalHours >= REQUIRED_DAILY_HOURS ? 'complete' : 'incomplete'
    }
    return 'active'
  }

  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const todayStart = new Date(today)
  todayStart.setHours(0, 0, 0, 0)

  if (dayStart < todayStart && !isWeekend(date)) return 'absent'
  return 'empty'
}

export function getMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []

  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day))
  }
  while (cells.length % 7 !== 0) {
    cells.push(null)
  }
  return cells
}
