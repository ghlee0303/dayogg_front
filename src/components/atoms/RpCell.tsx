import { ChevronDown, ChevronUp } from "lucide-react"

export function RpCell({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-red-400">
        <ChevronUp size={14} />
        {value.toLocaleString()}
      </span>
    )
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-blue-400">
        <ChevronDown size={14} />
        {Math.abs(value).toLocaleString()}
      </span>
    )
  }
  return <span>{value}</span>
}