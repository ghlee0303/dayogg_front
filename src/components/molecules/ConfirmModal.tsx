import { Modal } from '@/components/atoms/Modal'

interface ConfirmModalProps {
  message: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal onClose={onCancel}>
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-80 flex flex-col gap-4">
        <div className="text-gray-300 text-sm">{message}</div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-sm transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-sm transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}