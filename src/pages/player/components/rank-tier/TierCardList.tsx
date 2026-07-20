import { Children } from 'react'

interface TierCardListProps {
  children: React.ReactNode
}

export function TierCardList({ children }: TierCardListProps) {
  return (
    <div className="overflow-x-auto custom-scrollbar mx-auto mt-3 pb-2 max-w-5xl px-4 md:px-0">
      <div className="flex gap-3">
        {Children.map(children, child => (
          <div className="shrink-0">
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}