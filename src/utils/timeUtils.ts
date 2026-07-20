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

// 과거 시각 → "방금 전 / N분 전 / N시간 전 / N일 전"
export function formatTimeAgo(dateTime: string | null): string {
  if (dateTime == null) return ''

  const time = new Date(dateTime).getTime()
  if (Number.isNaN(time)) return ''

  const minutes = Math.floor((Date.now() - time) / 60_000)
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
