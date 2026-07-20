import { createApiUrl, applyUrlParams } from '@/utils/apiUtils'
import { useState, useEffect, useRef, useCallback } from 'react'

export interface SSEOptions {
  urlParams?: string[]
  params?: Record<string, string>
  onMessage?: (event: MessageEvent) => void
  onError?: (event: MessageEvent) => void
  onOpen?: (event: Event) => void
}

interface SSEState {
  isConnected: boolean
  isConnecting: boolean
  error: Event | null
  lastMessage: MessageEvent | null
}

export function useSSE(url: string) {
  const [state, setState] = useState<SSEState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastMessage: null,
  })

  const eventSourceRef = useRef<EventSource | null>(null)

  /** SSE 연결을 종료한다 */
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setState({ isConnected: false, isConnecting: false, error: null, lastMessage: null })
  }, [])

  /** SSE 연결을 시작(또는 재시작)한다 */
  const connect = useCallback((options?: SSEOptions) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    const { urlParams, params, onMessage, onError, onOpen } = options ?? {}

    const resolvedUrl = urlParams ? applyUrlParams(url, urlParams) : url
    const eventSource = new EventSource(createApiUrl(resolvedUrl, { ...params }))
    eventSourceRef.current = eventSource

    eventSource.onopen = (event) => {
      setState(prev => ({ ...prev, isConnected: true }))
      onOpen?.(event)
    }

    eventSource.onmessage = (event) => {
      setState(prev => ({ ...prev, isConnecting: false, lastMessage: event }))
      onMessage?.(event)
      eventSource.close()
    }

    eventSource.addEventListener('error', (event: MessageEvent) => {
      setState(prev => ({ ...prev, isConnected: false, isConnecting: false, error: event }))
      onError?.(event)
      eventSource.close()
    })
  }, [url])

  useEffect(() => {
    return () => { disconnect() }
  }, [disconnect])

  return {
    ...state,
    connect,
    disconnect,
  }
}
