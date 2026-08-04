// 지속 시간(초) → "N분 N초"
export function formatDuration(value: string | number): string {
  const totalSeconds = Math.round(Number(value))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}분 ${seconds}초`
}

// 게임 시간(초) → "mm:ss"
export function formatPlayTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// 과거 시각 → 지금까지 지난 시간(분). 값이 없거나 파싱할 수 없으면 null
export function minutesSince(dateTime: string | null | undefined): number | null {
  if (dateTime == null) return null

  const time = new Date(dateTime).getTime()
  if (Number.isNaN(time)) return null

  return Math.floor((Date.now() - time) / 60_000)
}

// 과거 시각 → "방금 전 / N분 전 / N시간 전 / N일 전"
export function formatTimeAgo(dateTime: string | null): string {
  const minutes = minutesSince(dateTime)
  if (minutes == null) return ''

  if (minutes < 3) return '방금 전'
  if (minutes < 60) return `${Math.max(minutes, 0)}분 전`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`

  return `${Math.floor(hours / 24)}일 전`
}

// "YYYY-MM-DD" → "MMDD"
export const formatDateMMDD = (date?: string): string => {
  if (!date) return ''
  const [, mm, dd] = date.split('-')
  if (!mm || !dd) return ''
  return `${mm}${dd}`
}

// "YYYY-MM-DDTHH:mm:ss" → "YYYY-MM-DD"
export function extractDate(value: string | undefined | null): string {
  if (!value) return ""
  return value.split('T')[0]
}
