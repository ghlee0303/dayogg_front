
interface DiverProps {
  color: string
}

const colorClasses: Record<string, string> = {
  default: 'border-gray-700',
  light: 'border-gray-300',
  dark: 'border-gray-900',
  black: 'border-black',
}

export function Divider({ color = 'default' }: DiverProps) {
  return <div className={`border-t ${colorClasses[color]}`} />
}