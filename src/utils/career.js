// Date helpers for the career journey (src/components/CareerJourney.vue).
// Dates are 'YYYY-MM' or 'YYYY'; a missing end means "now".

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** 'YYYY-MM' | 'YYYY' | Date → fractional year (2021-01 → 2021.0). */
export function toYear(d) {
  if (d instanceof Date) return d.getFullYear() + d.getMonth() / 12
  const [y, m] = String(d).split('-').map(Number)
  return y + (m ? (m - 1) / 12 : 0)
}

/** Whole months covered by a role, inclusive of both end months. */
export function monthsBetween(start, end) {
  return Math.round((toYear(end) - toYear(start)) * 12) + 1
}

/** 51 → '4 yrs 3 mos' */
export function formatDuration(months) {
  const y = Math.floor(months / 12)
  const m = months % 12
  const part = (n, unit) => (n ? `${n} ${unit}${n === 1 ? '' : 's'}` : '')
  return [part(y, 'yr'), part(m, 'mo')].filter(Boolean).join(' ') || '1 mo'
}

const label = (d) => {
  const [y, m] = String(d).split('-')
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y
}

/** { start: '2021-01', end: '2025-03' } → 'Jan 2021 — Mar 2025' */
export const formatPeriod = ({ start, end }) => `${label(start)} — ${end ? label(end) : 'Present'}`
