/**
 * Error handling utilities
 */

export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export const handleApiError = (error: any): APIError => {
  if (error.response) {
    return new APIError(
      error.response.status,
      error.response.data?.message || error.message,
      error.response.data
    )
  }
  if (error.request) {
    return new APIError(0, 'No response from server', error)
  }
  return new APIError(0, error.message, error)
}

export const getErrorMessage = (error: any): string => {
  if (error instanceof APIError) {
    return error.message
  }
  if (error.response?.data?.detail) {
    return error.response.data.detail
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}
