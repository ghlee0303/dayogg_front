import { useEffect, useRef, useState } from 'react'
import { Input } from './Input'

type InputProps = React.ComponentProps<typeof Input>

interface CommitInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: string
  onCommit: (value: string) => void
  normalize?: (text: string) => string
}

export function CommitInput({
  value,
  onCommit,
  normalize,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: CommitInputProps) {
  const [text, setText] = useState(value)
  const isFocusedRef = useRef(false)

  useEffect(() => {
    if (!isFocusedRef.current) setText(value)
  }, [value])

  const commit = () => {
    const finalText = normalize ? normalize(text) : text
    setText(finalText)
    if (finalText !== value) onCommit(finalText)
  }

  return (
    <Input
      {...props}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onFocus={(e) => {
        isFocusedRef.current = true
        onFocus?.(e)
      }}
      onBlur={(e) => {
        isFocusedRef.current = false
        commit()
        onBlur?.(e)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
        onKeyDown?.(e)
      }}
    />
  )
}
