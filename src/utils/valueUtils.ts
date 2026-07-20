import { formatDuration } from '@/utils/timeUtils'

export function formatNumber(value: string | number, decimals: number = 2): string {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? value.toLocaleString() : parseFloat(value.toFixed(decimals)).toLocaleString()
  }
  return value
}

export const truncateText = (text: string, max_length: number): string =>
  text.length > max_length
    ? `${text.slice(0, max_length)}...`
    : text

export type ValueType = 'number' | 'string' | 'round' | 'percent' | 'time';

export function displayFormatNumber(value: string | number, type: ValueType, decimals?: number): string {
  const numberValue = Number(value);

  if (type === 'string' || isNaN(numberValue)) return String(value);

  switch (type) {
    case 'number': return formatNumber(numberValue, decimals)
    case 'round': return Math.round(numberValue).toLocaleString()
    case 'percent': return `${formatNumber(numberValue * 100, decimals)}%`
    case 'time': return formatDuration(numberValue)
  }
}

export function displayPercentAndValue(percent: number, value: number) {
  return `${displayFormatNumber(percent, "percent", 1)} (${value})`
}

export const clampNumber = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

export const toPercent = (value: string | number | undefined, max: number = 100): number =>
  value === undefined ? 0 : Math.min((Number(value) / max) * 100, 100)
