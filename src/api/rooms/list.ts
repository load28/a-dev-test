/**
 * Room List API
 * GET /api/rooms endpoint with filtering, pagination, and sorting
 */

import type { RoomListParams, RoomListResponse, ApiError } from '../../types/room'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

/**
 * Custom error class for Room API errors
 */
export class RoomApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'RoomApiError'
  }
}

/**
 * Build query string from RoomListParams
 */
function buildQueryString(params: RoomListParams): string {
  const searchParams = new URLSearchParams()

  // Pagination
  if (params.page !== undefined) {
    searchParams.append('page', params.page.toString())
  }
  if (params.limit !== undefined) {
    searchParams.append('limit', params.limit.toString())
  }

  // Filtering
  if (params.userId) {
    searchParams.append('userId', params.userId)
  }
  if (params.hasReservation !== undefined) {
    searchParams.append('hasReservation', params.hasReservation.toString())
  }
  if (params.isAvailable !== undefined) {
    searchParams.append('isAvailable', params.isAvailable.toString())
  }
  if (params.minCapacity !== undefined) {
    searchParams.append('minCapacity', params.minCapacity.toString())
  }
  if (params.maxCapacity !== undefined) {
    searchParams.append('maxCapacity', params.maxCapacity.toString())
  }
  if (params.location) {
    searchParams.append('location', params.location)
  }
  if (params.amenities && params.amenities.length > 0) {
    params.amenities.forEach(amenity => {
      searchParams.append('amenities', amenity)
    })
  }

  // Sorting
  if (params.sortBy) {
    searchParams.append('sortBy', params.sortBy)
  }
  if (params.order) {
    searchParams.append('order', params.order)
  }

  // Search
  if (params.search) {
    searchParams.append('search', params.search)
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Fetch rooms with filtering, pagination, and sorting
 *
 * @param params - Query parameters for filtering, pagination, and sorting
 * @param accessToken - JWT access token for authentication
 * @returns Promise<RoomListResponse> - Paginated list of rooms with reservation info
 *
 * @example
 * ```typescript
 * // Get first page of rooms
 * const response = await getRooms({ page: 1, limit: 10 }, token)
 *
 * // Get rooms with active reservations for a specific user
 * const userRooms = await getRooms({
 *   userId: 'user-123',
 *   hasReservation: true
 * }, token)
 *
 * // Get available rooms sorted by price
 * const availableRooms = await getRooms({
 *   isAvailable: true,
 *   sortBy: 'pricePerHour',
 *   order: 'asc'
 * }, token)
 * ```
 */
export async function getRooms(
  params: RoomListParams = {},
  accessToken: string
): Promise<RoomListResponse> {
  try {
    const queryString = buildQueryString(params)
    const url = `${API_BASE_URL}/rooms${queryString}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw await handleErrorResponse(response)
    }

    const data: RoomListResponse = await response.json()
    return data
  } catch (error) {
    if (error instanceof RoomApiError) {
      throw error
    }
    throw new RoomApiError(
      'Failed to fetch rooms',
      'NETWORK_ERROR',
      error
    )
  }
}

/**
 * Handle error responses from the API
 */
async function handleErrorResponse(response: Response): Promise<RoomApiError> {
  let errorMessage = 'An error occurred while fetching rooms'
  let errorCode = 'UNKNOWN_ERROR'
  let details: unknown = undefined

  try {
    const errorData: ApiError = await response.json()
    errorMessage = errorData.message || errorMessage
    errorCode = errorData.code || mapHttpStatusToErrorCode(response.status)
    details = errorData.details
  } catch {
    errorCode = mapHttpStatusToErrorCode(response.status)
  }

  return new RoomApiError(errorMessage, errorCode, details)
}

/**
 * Map HTTP status codes to error codes
 */
function mapHttpStatusToErrorCode(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST'
    case 401:
      return 'UNAUTHORIZED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 500:
      return 'SERVER_ERROR'
    case 503:
      return 'SERVICE_UNAVAILABLE'
    default:
      return 'UNKNOWN_ERROR'
  }
}

/**
 * Default export for convenience
 */
export default {
  getRooms,
}
