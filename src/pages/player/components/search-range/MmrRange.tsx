import { RangeSlider } from '@/components/atoms/RangeSlider'
import { NumberCell } from '@/components/atoms/NumberCell'
import { Selector, type SelectorOptions } from '@/components/molecules/Selector'
import { isTopTier, TierEnum } from '@/types/TierType'
import { useTierRange } from '@/contexts/meta/TierRangeContext'
import type {
  Bound,
  RangeEndpoint,
  RangeSideEnum,
  SearchRangeLimit,
  SearchRangeOption,
} from "@/pages/player/components/search-range/type/SearchRangeOptionType"
import { useMemo } from 'react'

const MMR_STEP = 100

interface SideState {
  mmr: number
  tierEnum: TierEnum
  isTop: boolean
  slider: number | undefined
}

interface MmrEndpointProps {
  side: SideState
  numberRange: Bound
  tierOptions: SelectorOptions[]
  onMmrCommit: (v: number) => void
  onTierChange: (tier: TierEnum) => void
}

function MmrEndpoint({ side, numberRange, tierOptions, onMmrCommit, onTierChange }: MmrEndpointProps) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 md:flex-none md:w-[130px]">
      <NumberCell
        value={side.slider ?? null}
        min={numberRange.min}
        max={numberRange.max}
        onCommit={onMmrCommit}
      />
      <Selector
        options={tierOptions}
        value={side.tierEnum}
        onChange={(v) => onTierChange(v as TierEnum)}
        backgroundColor="dark"
        width="100%"
      />
    </div>
  )
}

interface MmrRangeProps {
  selected: SearchRangeOption
  limit: SearchRangeLimit
  tierOptions: SelectorOptions[]
  onRangeChange: (side: RangeSideEnum, changes: Partial<RangeEndpoint>) => void
}

export function MmrRange({
  selected,
  limit,
  tierOptions,
  onRangeChange,
}: MmrRangeProps) {
  const { tierRangeMap } = useTierRange()

  const bounds: Bound = {
    min: limit.lowestMmr,
    max: limit.highestMmr,
  }

  // mmr↔tier 파생은 표시(겉 값)에서만 계산. selected(options)에는 반영하지 않음.
  const buildSide = (
    endpoint: RangeEndpoint,
    side: RangeSideEnum,
  ): SideState => {
    const parkAt = side === 'START' ? bounds.min : bounds.max
    const isTop = isTopTier(endpoint.tierEnum)

    return {
      mmr: endpoint.mmr ?? parkAt,
      tierEnum: endpoint.tierEnum ?? 'UNRANK',
      isTop,
      slider: isTop ? undefined : endpoint.mmr,
    }
  }

  const start = buildSide(selected.range.START, 'START')
  const end = buildSide(selected.range.END, 'END')

  const endTierOptions = useMemo(() => {
    const result = tierOptions.map((opt) =>
      opt.value === 'MITHRIL' ? { ...opt, label: `${opt.label}+` } : opt
    )

    // const hiddenMithril = buildHiddenTierOption(tierOptions, 'MITHRIL')
    // if (hiddenMithril) result.push(hiddenMithril)

    return result;
  }, [tierOptions])

  const validateStartTier = (tier: TierEnum): string | null => {
    const tierRange = tierRangeMap[tier];

    if (end.isTop) return null

    const lowerBound = isTopTier(tier) ? bounds.max : tierRange.start

    return lowerBound >= end.mmr
      ? '시작 티어는 종료 티어보다 높을 수 없습니다.'
      : null
  }

  const validateEndTier = (tier: TierEnum): string | null => {
    const tierRange = tierRangeMap[tier];

    if (isTopTier(tier)) return null

    const upperBound = Math.min(tierRange.end, bounds.max)

    return upperBound <= start.mmr
      ? '종료 티어는 시작 티어보다 낮을 수 없습니다.'
      : null
  }

  const handleTierChange = (side: RangeSideEnum) => (tier: TierEnum) => {
    const error = side === 'START' ? validateStartTier(tier) : validateEndTier(tier)

    if (error) {
      alert(error)
      return
    }

    onRangeChange(side, { tierEnum: tier })
  }

  const handleSliderChange = (newStart: number, newEnd: number) => {
    if (newStart !== start.slider) {
      onRangeChange('START', { mmr: newStart,  })
    }

    if (newEnd !== end.slider) {
      onRangeChange('END', { mmr: newEnd,  })
    }
  }

  return (
    <div className="px-2 flex flex-wrap items-center gap-3">
      <MmrEndpoint
        side={start}
        numberRange={{ min: bounds.min, max: Math.min(end.mmr - MMR_STEP, bounds.max) }}
        tierOptions={tierOptions}
        onMmrCommit={(v) => onRangeChange('START', { mmr: v, })}
        onTierChange={handleTierChange('START')}
      />
      <div className="order-last w-full md:order-none md:w-auto md:flex-1">
        <RangeSlider
          step={MMR_STEP}
          start={start.slider}
          end={end.slider}
          min={bounds.min}
          max={bounds.max}
          onChange={handleSliderChange}
        />
      </div>
      <MmrEndpoint
        side={end}
        numberRange={{ min: start.mmr + MMR_STEP, max: bounds.max }}
        tierOptions={endTierOptions}
        onMmrCommit={(v) => onRangeChange('END', { mmr: v,  })}
        onTierChange={handleTierChange('END')}
      />
    </div>
  )
}
