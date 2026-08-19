import { Plus, X } from 'lucide-react'
import { Modal } from '@/components/atoms/Modal'
import { Button } from '@/components/atoms/Button'
import { CommitInput } from '@/components/atoms/CommitInput'
import { DateRangeInput } from '@/components/atoms/DateRangeInput'
import { Selector, type SelectorOptions } from '@/components/molecules/Selector'
import { truncateText } from '@/utils/valueUtils'
import { extractDate } from '@/utils/timeUtils'
import { MmrRange } from './MmrRange'
import {
  DEFAULT_PRESETS,
  LABEL_MAX_LENGTH,
  type RangeEndpoint,
  type RangeSideEnum,
  type SearchRangeLimit,
  type SearchRangeOption,
} from "@/pages/player/components/search-range/type/SearchRangeOptionType"
import { useSearchRangeOptions } from './hook/useSearchRangeOptions'
import { useSeason } from '@/contexts/meta/SeasonContext'

interface SearchRangeModalProps {
  rangeLimit: SearchRangeLimit
  initialOptions?: SearchRangeOption[]
  onConfirm: (confirmOptions: SearchRangeOption[]) => void
  onClose: () => void
}

interface OptionListPanelProps {
  options: SearchRangeOption[]
  selectedIndex: number | null
  onSelect: (index: number) => void
  onAdd: () => void
  onDelete: (index: number) => void
}

function OptionListHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between shrink-0">
      <h2 className="text-xl font-bold text-white">검색 폭 조정</h2>
      <button
        type="button"
        aria-label="옵션 추가"
        className="p-1 rounded-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
        onClick={onAdd}
      >
        <Plus size={16} />
      </button>
    </div>
  )
}

interface OptionListItemProps {
  label: string
  selected: boolean
  onSelect: () => void
  onDelete: () => void
}

function OptionListItem({ label, selected, onSelect, onDelete }: OptionListItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={`shrink-0 min-w-[6rem] md:min-w-0 border rounded-md py-3 px-3 text-sm text-gray-200 hover:bg-gray-700 transition-colors cursor-pointer flex items-center justify-between gap-2 ${selected
        ? 'border-blue-500 bg-gray-700'
        : 'border-gray-600'
        }`}
    >
      <span className="truncate">{truncateText(label, LABEL_MAX_LENGTH)}</span>
      <button
        type="button"
        aria-label="옵션 삭제"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="shrink-0 p-1 rounded-sm text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}

function OptionListPanel({ options, selectedIndex, onSelect, onAdd, onDelete }: OptionListPanelProps) {
  return (
    <div className="custom-scrollbar w-full md:w-56 shrink-0 border border-gray-700 rounded-md p-3 flex flex-col gap-3 md:overflow-y-auto">
      <OptionListHeader onAdd={onAdd} />
      <div className="custom-scrollbar flex flex-row md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0">
        {options.map((option, index) => (
          <OptionListItem
            key={index}
            label={option.label}
            selected={selectedIndex === index}
            onSelect={() => onSelect(index)}
            onDelete={() => onDelete(index)}
          />
        ))}
      </div>
    </div>
  )
}

interface OptionEditorProps {
  selected: SearchRangeOption
  onChange: (changes: Partial<SearchRangeOption>) => void
  onRangeChange: (side: RangeSideEnum, changes: Partial<RangeEndpoint>) => void
  tierOptions: SelectorOptions[]
  limit: SearchRangeLimit
}

function OptionEditor({
  selected,
  onChange,
  onRangeChange,
  tierOptions,
  limit,
}: OptionEditorProps) {
  const { nowSeasonMeta } = useSeason()

  const handleDateChange = (newStart: string, newEnd: string) => {
    if (newStart != selected.range.START.date) {
      onRangeChange('START', { date: newStart })
    }

    if (newEnd != selected.range.END.date) {
      onRangeChange('END', { date: newEnd })
    }
  }

  return (
    <div className="mt-0 md:mt-5 flex-1 min-w-0 flex flex-col gap-4 md:gap-5">
      <div className="flex flex-col gap-3 w-full md:w-2/5">
        <span className="text-sm text-gray-200 font-semibold">이름</span>
        <CommitInput
          variant="black"
          fontSize={14}
          type="text"
          value={selected.label}
          onCommit={(v) => onChange({ label: v })}
        />
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm text-gray-200 font-semibold">점수</span>
        <MmrRange
          selected={selected}
          limit={limit}
          tierOptions={tierOptions}
          onRangeChange={onRangeChange}
        />
      </div>

      <div className="mt-0 md:mt-2 flex items-end gap-3">
        <div className='flex flex-col gap-3 w-full md:w-3/5 md:min-w-[280px]'>
          <span className="text-sm text-gray-200 font-semibold">날짜</span>
          <DateRangeInput
            startDate={selected.range.START.date ?? ''}
            endDate={selected.range.END.date ?? ''}
            min={extractDate(nowSeasonMeta?.startDate)}
            max={extractDate(nowSeasonMeta?.endDate)}
            onChange={handleDateChange}
          />
        </div>
      </div>
    </div>
  )
}

function EditorPlaceholder({ message }: { message: string }) {
  return (
    <div className="mt-0 md:mt-5 flex-1 min-h-[80px] md:min-h-0 flex items-center justify-center text-gray-400 text-sm">
      {message}
    </div>
  )
}

interface ModalFooterProps {
  onCancel: () => void
  onConfirm: () => void
}

function ModalFooter({ onCancel, onConfirm }: ModalFooterProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="ghost" onClick={onCancel} className="text-sm text-white">
        닫기
      </Button>
      <Button variant="secondary" onClick={onConfirm} className="text-sm">
        확인
      </Button>
    </div>
  )
}

export function SearchRangeModal({
  rangeLimit,
  initialOptions = DEFAULT_PRESETS,
  onConfirm,
  onClose,
}: SearchRangeModalProps) {
  const {
    options,
    selected,
    selectedIndex,
    tierOptions,
    selectOption,
    addOption,
    deleteOption,
    updateSelected,
    updateRange,
  } = useSearchRangeOptions(initialOptions, rangeLimit)

  const handleConfirm = () => {
    // onClose()
    onConfirm(options)
  }

  return (
    <Modal onClose={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl p-4 md:p-6 flex flex-col gap-4 md:gap-6 w-[900px] max-w-full max-h-[85vh] md:h-[420px]">
        <div className="custom-scrollbar flex flex-col md:flex-row gap-4 md:gap-6 flex-1 min-h-0 overflow-y-auto md:overflow-y-visible">
          <OptionListPanel
            options={options}
            selectedIndex={selectedIndex}
            onSelect={selectOption}
            onAdd={addOption}
            onDelete={deleteOption}
          />
          {!selected ? (
            <EditorPlaceholder message="옵션을 선택하세요" />
          ) : (
            <OptionEditor
              selected={selected}
              onChange={updateSelected}
              onRangeChange={updateRange}
              tierOptions={tierOptions}
              limit={rangeLimit}
            />
          )}
        </div>
        <ModalFooter onCancel={onClose} onConfirm={handleConfirm} />
      </div>
    </Modal>
  )
}
