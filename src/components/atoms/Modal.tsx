interface ModalProps {
  onClose: () => void
  children: React.ReactNode
  width?: number | string
  height?: number | string
}

export function Modal({ onClose, children, width, height }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
        style={{ width, height }}
      >
        {children}
      </div>
    </div>
  )
}
