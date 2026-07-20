type InputVariant = 'black' | 'white'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant
  width?: number | string
  fontSize?: number
}

const variantClass: Record<InputVariant, string> = {
  white: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
  black: 'bg-gray-900 border-gray-700 text-white placeholder-gray-500',
}

const baseClass =
  'border rounded-sm px-3 py-2 w-full focus:outline-hidden focus:ring-2 focus:ring-blue-500 disabled:opacity-50'

export function Input({
  variant = 'white',
  width,
  fontSize,
  className = '',
  style,
  ...props
}: InputProps) {
  return (
    <input
      className={`${baseClass} ${variantClass[variant]} ${className}`}
      style={{ ...style, width, fontSize }}
      {...props}
    />
  )
}
