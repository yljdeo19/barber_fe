export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const API_URL = import.meta.env.VITE_API_URL || '/api'

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers
    }
  })

  const contentType = response.headers.get('content-type')
  const data: unknown = contentType?.includes('application/json') ? await response.json() : null
  if (response.ok) return data as T

  const message =
    typeof data === 'object' && data && 'message' in data
      ? Array.isArray(data.message)
        ? data.message.join(', ')
        : String(data.message)
      : 'Не удалось выполнить запрос'
  throw new ApiError(message, response.status)
}

export const jsonBody = (value: unknown) => JSON.stringify(value)
