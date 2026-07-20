import { HttpMethod } from '@/types/ApiType'
import { createApiUrl } from '@/utils/apiUtils'

interface RequestOptions<TBody> {
  method?: HttpMethod
  params?: Record<string, string>
  body?: TBody
  headers?: Record<string, string>
}

interface ErrorResponse {
  status: number
  message: string
  type?: string
}

export class ApiError extends Error implements ErrorResponse {
  constructor(public status: number, public message: string, public type?: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<TResponse = unknown, TBody = unknown>(
  url: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> {
  const { method = 'GET', params, body, headers } = options

  const response = await fetch(createApiUrl(url, params), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorBody: ErrorResponse = await response.json().catch(() => ({ message: response.statusText }))
    
    throw new ApiError(
      errorBody.status,
      errorBody.message ?? response.statusText,
      errorBody.type
    )
  }

  const text = await response.text()
  try {
    return JSON.parse(text) as TResponse
  } catch (e) {
    console.error('Failed to parse JSON response:', { url, status: response.status, body: text })
    throw e
  }
}

export const api = {
  get: <TResponse = unknown>(url: string, params?: Record<string, string>, headers?: Record<string, string>) =>
    request<TResponse>(url, { method: 'GET', params, headers }),

  post: <TResponse = unknown, TBody = unknown>(url: string, body?: TBody, params?: Record<string, string>, headers?: Record<string, string>) =>
    request<TResponse, TBody>(url, { method: 'POST', body, params, headers }),

  put: <TResponse = unknown, TBody = unknown>(url: string, body?: TBody, params?: Record<string, string>, headers?: Record<string, string>) =>
    request<TResponse, TBody>(url, { method: 'PUT', body, params, headers }),

  patch: <TResponse = unknown, TBody = unknown>(url: string, body?: TBody, params?: Record<string, string>, headers?: Record<string, string>) =>
    request<TResponse, TBody>(url, { method: 'PATCH', body, params, headers }),

  delete: <TResponse = unknown>(url: string, params?: Record<string, string>, headers?: Record<string, string>) =>
    request<TResponse>(url, { method: 'DELETE', params, headers }),
}
