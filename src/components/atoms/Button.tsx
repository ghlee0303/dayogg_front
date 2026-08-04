interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost'
  fontSize?: number
}

export function Button({ variant = 'primary', fontSize, className = '', style, ...props }: ButtonProps) {
  const base = 'px-3 py-2 rounded-sm font-medium transition-colors focus:outline-hidden focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed'
  // hover는 disabled 요소에도 적용되므로 enabled:로 막는다
  const variants = {
    primary: 'bg-blue-600 text-white enabled:hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 enabled:hover:bg-gray-300 focus:ring-gray-400',
    success: 'bg-green-600 text-white enabled:hover:bg-green-700 focus:ring-green-500',
    // 상태 표시용. 누를 수 없는 버튼에 쓰므로 hover 색 변화가 없다
    warning: 'bg-yellow-400 text-gray-900 focus:ring-yellow-400',
    danger: 'bg-red-600 text-white enabled:hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent enabled:hover:bg-gray-700 focus:ring-gray-500',
  }

  return <button className={`${base} ${variants[variant]} ${className}`} style={{ fontSize, ...style }} {...props} />
}