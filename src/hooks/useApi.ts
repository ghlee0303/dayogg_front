import { useState, useCallback } from 'react'
import { api, ApiError } from '@/utils/api'
import { applyUrlParams } from '@/utils/apiUtils'
import { HttpMethod } from '@/types/ApiType'

export interface UseApiOptions<TBody, TResponse> {
  urlParams?: String[]
  method?: HttpMethod
  params?: Record<string, string | number | null | undefined>
  body?: TBody
  headers?: Record<string, string>
  onSuccess?: (data: TResponse) => void
  onError?: (error: ApiError) => void
}

interface UseApiState<TResponse> {
  data: TResponse | null
  loading: boolean
  error: ApiError | null
}

export function useApi<TResponse = unknown, TBody = unknown>(url: string, options: UseApiOptions<TBody, TResponse> = {}) {
  const [state, setState] = useState<UseApiState<TResponse>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (overrideOptions?: UseApiOptions<TBody, TResponse>) => {
    const { urlParams, method = 'GET', params, body, headers, onSuccess, onError } = { ...options, ...overrideOptions }

    const resolvedUrl = urlParams ? applyUrlParams(url, urlParams as string[]) : url

    setState(prev => ({ ...prev, loading: true, error: null }))

    const requestParams: Record<string, string> = {}
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined) requestParams[key] = String(value)
      }
    }

    try {
      let data: TResponse

      if (method === 'GET') {
        data = await api.get<TResponse>(resolvedUrl, requestParams, headers)
      } else if (method === 'POST') {
        data = await api.post<TResponse, TBody>(resolvedUrl, body, requestParams, headers)
      } else if (method === 'PUT') {
        data = await api.put<TResponse, TBody>(resolvedUrl, body, requestParams, headers)
      } else if (method === 'PATCH') {
        data = await api.patch<TResponse, TBody>(resolvedUrl, body, requestParams, headers)
      } else {
        data = await api.delete<TResponse>(resolvedUrl, requestParams, headers)
      }

      setState({ data, loading: false, error: null })
      onSuccess?.(data)

      return data
    } catch (error) {
      console.error(error);
      const apiError = error instanceof ApiError ? error : new ApiError(0, '알 수 없는 오류가 발생했습니다.')
      setState({ data: null, loading: false, error: apiError })

      if (onError) onError(apiError)
      else throw apiError
    }
  }, [url])

  return { ...state, execute }
}