import { displayFormatNumber, ValueType } from '@/utils/valueUtils'
import { type ReactNode } from 'react'

export interface TableColumn<T> {
  key: string
  header: string
  align?: 'left' | 'center' | 'right'
  decimals?: number
  className?: string
  type?: ValueType
  width?: number | string
  render?: (row: T) => ReactNode
}

interface TableViewProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string
  emptyMessage?: string
  sortKey?: (row: T) => number
}

function renderCell<T>(col: TableColumn<T>, row: T) {
  if (col.render) return col.render(row)

  const value = (row as Record<string, string | number>)[col.key];

  return displayFormatNumber(value, col.type ?? 'number', col.decimals);
}

function getAlign(align?: 'left' | 'center' | 'right') {
  return `text-${align ?? 'center'}`
}

export function TableView<T>({ columns, data, rowKey, emptyMessage = '데이터가 없습니다.', sortKey }: TableViewProps<T>) {
  const rows = sortKey ? [...data].sort((a, b) => sortKey(b) - sortKey(a)) : data

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-sm text-gray-300">
        <thead>
          <tr className="border-b border-white text-gray-300/60 text-xs">
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width }} className={`py-3 px-1 font-medium whitespace-pre-line ${getAlign(col.align)}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-gray-700/50 hover:bg-gray-800/50">
              {columns.map((col) => (
                <td key={col.key} className={`py-2 px-2 whitespace-nowrap ${getAlign(col.align)} ${col.className ?? ''}`}>
                  {renderCell(col, row)}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
