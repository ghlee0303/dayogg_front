import { HelpCircle } from 'lucide-react'
import { displayFormatNumber, ValueType } from '@/utils/valueUtils'
import { Divider } from '@/components/atoms/Divider'

export interface StatItemProps {
  label: string
  value: string | number
  type?: ValueType
  decimals?: number
  description?: string
  labelColor?: string
}

function StatLabel({ label, description, labelColor }: Partial<StatItemProps>) {
  return (
    <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
      <span className={`whitespace-pre-line ${labelColor}`}>{label}</span>
      {description && (
        <span className="group relative inline-flex">
          <HelpCircle size={12} className="cursor-help text-gray-500 hover:text-gray-300" />
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-sm bg-gray-900 px-2 py-1 text-[11px] font-normal normal-case tracking-normal text-gray-100 shadow-lg group-hover:block"
          >
            {description}
          </span>
        </span>
      )}
    </p>
  )
}

function StatItem({
  label,
  value,
  type = 'number',
  decimals,
  description,
  labelColor
}: StatItemProps) {

  return (
    <div className="flex flex-1 flex-col gap-0.5">
      <p className="font-bold leading-tight text-white text-base">
        {displayFormatNumber(value, type, decimals)}
      </p>
      <StatLabel label={label} description={description} labelColor={labelColor} />
    </div>
  )
}

export function StatRow({ items, columns = 5, className }: { items: StatItemProps[]; columns?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-3 ${className ?? ''}`}>
      <div
        className="grid grid-cols-3 gap-x-2 gap-y-4 md:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
        style={{ '--cols': columns } as React.CSSProperties}
      >
        {items.map((item, index) => (
          <StatItem key={index} {...item} />
        ))}
      </div>
    </div>
  )
}

export function ExpandedTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className='mb-4'>
      <p className="text-sm font-semibold text-gray-300 mb-1">{children}</p>
      <Divider color="default" />
    </div>
  )
}
