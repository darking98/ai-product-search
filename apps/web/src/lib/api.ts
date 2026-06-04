const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api'

interface ErrorResponse {
  message?: string
}

interface ApiOptions {
  cache?: RequestCache
  next?: {
    tags?: string[]
    revalidate?: number
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'Error desconocido'
    try {
      const errorData: ErrorResponse = await response.json()
      message = errorData.message || message
    } catch {
      message = await response.text()
    }
    throw new Error(message)
  }

  const text = await response.text()
  if (!text) return undefined as T

  try {
    return JSON.parse(text) as T
  } catch {
    return undefined as T
  }
}

export const api = {
  async get<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      next: options?.next,
      cache: options?.cache
    })
    return handleResponse<T>(response)
  },

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiOptions
  ): Promise<T> {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined,
      next: options?.next,
      cache: options?.cache
    })
    return handleResponse<T>(response)
  },

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiOptions
  ): Promise<T> {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined,
      next: options?.next,
      cache: options?.cache
    })
    return handleResponse<T>(response)
  },

  async delete<T>(endpoint: string, options?: ApiOptions): Promise<T> {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      next: options?.next,
      cache: options?.cache
    })
    return handleResponse<T>(response)
  }
}
