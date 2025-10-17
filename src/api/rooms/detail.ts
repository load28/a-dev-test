/**
 * Room Detail API Service
 * Handles fetching detailed room information including facilities and reservations
 */

import type { RoomDetail, RoomDetailResponse, RoomApiError } from '../../types/room'
import { TokenStorage } from '../../utils/tokenStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

/**
 * Custom error class for Room API errors
 */
export class RoomError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = 'RoomError'
  }
}

/**
 * Room Detail Service Class
 * Manages API communication for room details
 */
class RoomDetailService {
  private baseUrl: string
  private tokenStorage: TokenStorage

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    this.tokenStorage = TokenStorage.getInstance()
  }

  /**
   * Fetch detailed room information by room ID
   * @param roomId - The unique identifier of the room
   * @returns Promise containing room details with facilities and reservations
   * @throws RoomError if the request fails
   */
  async getRoomDetail(roomId: string): Promise<RoomDetail> {
    if (!roomId || roomId.trim() === '') {
      throw new RoomError('Room ID is required', 400, 'INVALID_ROOM_ID')
    }

    try {
      const accessToken = this.tokenStorage.getAccessToken()

      if (!accessToken) {
        throw new RoomError('Authentication required', 401, 'UNAUTHORIZED')
      }

      const response = await fetch(`${this.baseUrl}/rooms/${roomId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      const data: RoomDetailResponse = await response.json()

      // Validate response structure
      if (!data.room) {
        throw new RoomError('Invalid response format', 500, 'INVALID_RESPONSE')
      }

      return data.room
    } catch (error) {
      if (error instanceof RoomError) {
        throw error
      }

      // Network or other unexpected errors
      throw new RoomError(
        error instanceof Error ? error.message : 'Failed to fetch room details',
        500,
        'NETWORK_ERROR'
      )
    }
  }

  /**
   * Fetch detailed room information by room ID (public method, no auth required)
   * @param roomId - The unique identifier of the room
   * @returns Promise containing room details with facilities (no reservations)
   * @throws RoomError if the request fails
   */
  async getRoomDetailPublic(roomId: string): Promise<RoomDetail> {
    if (!roomId || roomId.trim() === '') {
      throw new RoomError('Room ID is required', 400, 'INVALID_ROOM_ID')
    }

    try {
      const response = await fetch(`${this.baseUrl}/rooms/${roomId}/public`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      const data: RoomDetailResponse = await response.json()

      if (!data.room) {
        throw new RoomError('Invalid response format', 500, 'INVALID_RESPONSE')
      }

      return data.room
    } catch (error) {
      if (error instanceof RoomError) {
        throw error
      }

      throw new RoomError(
        error instanceof Error ? error.message : 'Failed to fetch room details',
        500,
        'NETWORK_ERROR'
      )
    }
  }

  /**
   * Check if a room is available for booking
   * @param roomId - The unique identifier of the room
   * @param checkIn - Check-in date (ISO 8601 format)
   * @param checkOut - Check-out date (ISO 8601 format)
   * @returns Promise containing availability status
   */
  async checkRoomAvailability(
    roomId: string,
    checkIn: string,
    checkOut: string
  ): Promise<{ available: boolean; conflictingReservations?: string[] }> {
    if (!roomId || !checkIn || !checkOut) {
      throw new RoomError('Room ID, check-in, and check-out dates are required', 400, 'INVALID_PARAMS')
    }

    try {
      const accessToken = this.tokenStorage.getAccessToken()

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      const response = await fetch(
        `${this.baseUrl}/rooms/${roomId}/availability?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`,
        {
          method: 'GET',
          headers,
        }
      )

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof RoomError) {
        throw error
      }

      throw new RoomError(
        error instanceof Error ? error.message : 'Failed to check room availability',
        500,
        'NETWORK_ERROR'
      )
    }
  }

  /**
   * Handle error responses from the API
   */
  private async handleErrorResponse(response: Response): Promise<RoomError> {
    let errorMessage = 'An error occurred while processing your request'
    let errorCode = 'UNKNOWN_ERROR'

    try {
      const errorData: RoomApiError = await response.json()
      errorMessage = errorData.message || errorMessage
      errorCode = errorData.error || errorCode
    } catch {
      // If JSON parsing fails, use status-based message
      errorMessage = this.getErrorMessageByStatus(response.status)
    }

    return new RoomError(errorMessage, response.status, errorCode)
  }

  /**
   * Get error message based on HTTP status code
   */
  private getErrorMessageByStatus(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request parameters'
      case 401:
        return 'Authentication required'
      case 403:
        return 'Access denied'
      case 404:
        return 'Room not found'
      case 429:
        return 'Too many requests. Please try again later'
      case 500:
        return 'Internal server error'
      case 503:
        return 'Service temporarily unavailable'
      default:
        return 'An unexpected error occurred'
    }
  }

  /**
   * Create an authenticated fetch function with automatic token injection
   * Useful for making custom room-related API calls
   */
  createAuthenticatedFetch() {
    return async (url: string, options: RequestInit = {}): Promise<Response> => {
      const token = this.tokenStorage.getAccessToken()

      if (!token) {
        throw new RoomError('No access token available', 401, 'UNAUTHORIZED')
      }

      const headers = new Headers(options.headers)
      headers.set('Authorization', `Bearer ${token}`)
      headers.set('Content-Type', 'application/json')

      return fetch(url, {
        ...options,
        headers,
      })
    }
  }
}

// Export singleton instance
export const roomDetailService = new RoomDetailService()

// Export class for testing or custom configurations
export { RoomDetailService }
