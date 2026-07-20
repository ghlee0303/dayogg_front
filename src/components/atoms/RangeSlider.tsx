import type { ReactNode } from 'react'
import { Range, getTrackBackground } from 'react-range'
import type { IRenderThumbParams, IRenderTrackParams } from 'react-range/lib/types'

interface RangeSliderProps {
  step?: number
  start?: number
  end?: number
  min: number
  max: number
  onChange: (start: number, end: number) => void
}

interface SliderTrackProps {
  trackProps: IRenderTrackParams['props']
  children: ReactNode
  values: number[]
  min: number
  max: number
}

function SliderTrack({ trackProps, children, values, min, max }: SliderTrackProps) {
  return (
    <div
      onMouseDown={trackProps.onMouseDown}
      onTouchStart={trackProps.onTouchStart}
      style={{ ...trackProps.style, height: 24, display: 'flex', width: '100%' }}
    >
      <div
        ref={trackProps.ref}
        className="self-center w-full h-1 rounded-full"
        style={{
          background: getTrackBackground({
            values,
            colors: ['#6b7280', '#3b82f6', '#6b7280'],
            min,
            max,
          }),
        }}
      >
        {children}
      </div>
    </div>
  )
}

interface SliderThumbProps {
  thumbProps: IRenderThumbParams['props']
  index: number
}

function SliderThumb({ thumbProps, index }: SliderThumbProps) {
  const { key, ...rest } = thumbProps
  return (
    <div
      key={key}
      {...rest}
      className="rounded-xs outline-hidden"
      style={{
        ...rest.style,
        width: 12,
        height: 20,
        backgroundColor: index === 0 ? '#22d3ee' : '#2563eb',
      }}
    />
  )
}

export function RangeSlider({
  min,
  max,
  step = 1,
  start,
  end,
  onChange,
}: RangeSliderProps) {
  const safeMax = max > min ? max : min + step
  const resolvedStart = start ?? min
  const resolvedEnd = end ?? max
  const values = [
    Math.min(Math.max(resolvedStart, min), safeMax),
    Math.min(Math.max(resolvedEnd, min), safeMax),
  ]

  const snap = (v: number): number => {
    if (v <= min) return min
    if (v >= safeMax) return safeMax
    
    const lower = Math.ceil(min / step) * step
    const upper = Math.floor(safeMax / step) * step

    if (v <= lower) return v - min < lower - v ? min : lower
    if (v >= upper) return safeMax - v < v - upper ? safeMax : upper

    return Math.round(v / step) * step
  }

  const handleChange = (vals: number[]) => {
    const nextStart = vals[0] === values[0] ? values[0] : snap(vals[0])
    const nextEnd = vals[1] === values[1] ? values[1] : snap(vals[1])
    onChange(nextStart, nextEnd)
  }

  return (
    <Range
      step={1}
      min={min}
      max={safeMax}
      values={values}
      onChange={handleChange}
      renderTrack={({ props, children }) => (
        <SliderTrack trackProps={props} values={values} min={min} max={safeMax}>
          {children}
        </SliderTrack>
      )}
      renderThumb={({ props, index }) => (
        <SliderThumb thumbProps={props} index={index} />
      )}
    />
  )
}
