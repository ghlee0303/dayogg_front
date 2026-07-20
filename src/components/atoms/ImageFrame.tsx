import { useState, useEffect } from 'react'

interface ImageFrameProps {
  src?: string
  alt?: string
  size?: number
  width?: number
  height?: number
  placeholder?: string
  isCircle?: boolean
  bgColor?: string
  /** 배경색 HEX 코드 (bgColor Tailwind 클래스보다 우선 적용) */
  bgColorCode?: string
}

export function ImageFrame({
  src,
  alt = '',
  size = 48,
  width,
  height,
  placeholder = '?',
  isCircle = false,
  bgColor,
  bgColorCode,
}: ImageFrameProps
) {
  const styleWidth = width || size
  const styleHeight = height || size

  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  const showImage = src && !hasError

  return (
    <div
      className={`flex items-center justify-center shrink-0 overflow-hidden ${showImage && !bgColorCode ? bgColor : ''} ${showImage ? '' : 'bg-gray-600'}`}
      style={{
        width: styleWidth,
        height: styleHeight,
        borderRadius: isCircle || !showImage ? '50%' : 0,
        backgroundColor: showImage ? bgColorCode : undefined,
      }}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{ borderRadius: isCircle ? '50%' : 0 }}
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-gray-400" style={{ fontSize: size * 0.3 }}>{placeholder}</span>
      )}
    </div>
  )
}
