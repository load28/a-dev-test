/**
 * Room Service
 * Handles all room-related API calls
 */

import type { RoomDetail, RoomDetailResponse } from '../types/room'
import { RoomError, RoomErrorCode } from '../types/room'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

/**
 * Room Service Class
 * Manages API communication for room operations
 */
class RoomService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Get room detail by ID
   *
   * @param roomId - The ID of the room to fetch
   * @param accessToken - Optional access token for authenticated requests
   * @returns Promise<RoomDetail> - Complete room information
   */
  async getRoomDetail(roomId: string, accessToken?: string): Promise<RoomDetail> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      const response = await fetch(`${this.baseUrl}/rooms/${roomId}`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      const result: RoomDetailResponse = await response.json()

      if (!result.success || !result.data) {
        throw new RoomError(
          result.message || 'Failed to fetch room details',
          RoomErrorCode.UNKNOWN_ERROR
        )
      }

      return result.data
    } catch (error) {
      if (error instanceof RoomError) {
        throw error
      }
      throw new RoomError(
        'Failed to fetch room details',
        RoomErrorCode.NETWORK_ERROR
      )
    }
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<RoomError> {
    let errorMessage = 'An error occurred while fetching room details'
    let errorCode = RoomErrorCode.UNKNOWN_ERROR

    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
      errorCode = this.mapHttpStatusToErrorCode(response.status)
    } catch {
      errorCode = this.mapHttpStatusToErrorCode(response.status)
    }

    return new RoomError(errorMessage, errorCode)
  }

  /**
   * Map HTTP status codes to RoomErrorCode
   */
  private mapHttpStatusToErrorCode(status: number): RoomErrorCode {
    switch (status) {
      case 401:
      case 403:
        return RoomErrorCode.UNAUTHORIZED
      case 404:
        return RoomErrorCode.NOT_FOUND
      default:
        return RoomErrorCode.UNKNOWN_ERROR
    }
  }

  /**
   * Create authenticated fetch with auto token injection
   */
  createAuthenticatedFetch(getAccessToken: () => string | null) {
    return async (roomId: string): Promise<RoomDetail> => {
      const token = getAccessToken()

      if (!token) {
        throw new RoomError(
          'No access token available',
          RoomErrorCode.UNAUTHORIZED
        )
      }

      return this.getRoomDetail(roomId, token)
    }
  }
}

// Export singleton instance
export const roomService = new RoomService()

// For testing purposes or custom configurations
export { RoomService }
