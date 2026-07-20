interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  fontSize?: number
}

export function Button({ variant = 'primary', fontSize, className = '', style, ...props }: ButtonProps) {
  const base = 'px-3 py-2 rounded-sm font-medium transition-colors focus:outline-hidden focus:ring-2'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-gray-700 focus:ring-gray-500',
  }

  return <button className={`${base} ${variants[variant]} ${className}`} style={{ fontSize, ...style }} {...props} />
}