import { useState, useEffect } from 'react'

interface ImageFrameProps {
  src?: string
  /** src가 없거나 로드에 실패했을 때 대신 쓰는 이미지 */
  fallbackSrc?: string
  alt?: string
  size?: number
  width?: number
  height?: number
  placeholder?: string
  isCircle?: boolean
  bgColor?: string
  /** 배경색 HEX 코드 (bgColor Tailwind 클래스보다 우선 적용) */
  bgColorCode?: string
  /** 바깥 프레임에 덧붙일 클래스. size를 덮으려면 !w-[..] 처럼 important 유틸을 쓴다 */
  className?: string
}

export function ImageFrame({
  src,
  fallbackSrc,
  alt = '',
  size = 48,
  width,
  height,
  placeholder = '?',
  isCircle = false,
  bgColor,
  bgColorCode,
  className,
}: ImageFrameProps
) {
  const styleWidth = width || size
  const styleHeight = height || size

  // 앞에서부터 시도해서 실패하면 다음 후보로 넘어간다
  const candidates = [src, fallbackSrc].filter(Boolean) as string[]
  const [failedCount, setFailedCount] = useState(0)

  useEffect(() => {
    setFailedCount(0)
  }, [src, fallbackSrc])

  const resolvedSrc = candidates[failedCount]
  const showImage = !!resolvedSrc

  return (
    <div
      className={`flex items-center justify-center shrink-0 overflow-hidden ${showImage && !bgColorCode ? bgColor : ''} ${showImage ? '' : 'bg-gray-600'} ${className ?? ''}`}
      style={{
        width: styleWidth,
        height: styleHeight,
        borderRadius: isCircle || !showImage ? '50%' : 0,
        backgroundColor: showImage ? bgColorCode : undefined,
      }}
    >
      {showImage ? (
        <img
          src={resolvedSrc}
          alt={alt}
          className="w-full h-full object-cover"
          style={{ borderRadius: isCircle ? '50%' : 0 }}
          onError={() => { setFailedCount(count => count + 1) }}
        />
      ) : (
        <span className="text-gray-400" style={{ fontSize: size * 0.3 }}>{placeholder}</span>
      )}
    </div>
  )
}
