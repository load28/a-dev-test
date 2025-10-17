/**
 * Room List Service
 * Handles all room list related API calls
 */

import type { Room, RoomListResponse, RoomListParams } from '../types/room'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export class RoomListError extends Error {
  constructor(
    message: string,
    public code: 'NETWORK_ERROR' | 'UNAUTHORIZED' | 'FETCH_FAILED' | 'UNKNOWN_ERROR',
    public statusCode?: number
  ) {
    super(message)
    this.name = 'RoomListError'
  }
}

/**
 * Room List Service Class
 * Manages API communication for room listings
 */
class RoomListService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Fetch list of rooms with optional filters
   */
  async getRooms(
    params: RoomListParams = {},
    accessToken?: string
  ): Promise<RoomListResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params.page !== undefined) {
        queryParams.append('page', params.page.toString())
      }
      if (params.pageSize !== undefined) {
        queryParams.append('pageSize', params.pageSize.toString())
      }
      if (params.status) {
        queryParams.append('status', params.status)
      }
      if (params.sortBy) {
        queryParams.append('sortBy', params.sortBy)
      }
      if (params.sortOrder) {
        queryParams.append('sortOrder', params.sortOrder)
      }

      const url = `${this.baseUrl}/rooms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      const data: RoomListResponse = await response.json()
      return data
    } catch (error) {
      if (error instanceof RoomListError) {
        throw error
      }
      throw new RoomListError('Failed to fetch rooms', 'NETWORK_ERROR')
    }
  }

  /**
   * Fetch a single room by ID
   */
  async getRoomById(roomId: string, accessToken?: string): Promise<Room> {
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

      const data: { room: Room } = await response.json()
      return data.room
    } catch (error) {
      if (error instanceof RoomListError) {
        throw error
      }
      throw new RoomListError('Failed to fetch room', 'FETCH_FAILED')
    }
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<RoomListError> {
    let errorMessage = 'An error occurred'
    let errorCode: 'NETWORK_ERROR' | 'UNAUTHORIZED' | 'FETCH_FAILED' | 'UNKNOWN_ERROR' = 'UNKNOWN_ERROR'

    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
      errorCode = this.mapHttpStatusToErrorCode(response.status)
    } catch {
      errorCode = this.mapHttpStatusToErrorCode(response.status)
    }

    return new RoomListError(errorMessage, errorCode, response.status)
  }

  /**
   * Map HTTP status codes to error codes
   */
  private mapHttpStatusToErrorCode(
    status: number
  ): 'NETWORK_ERROR' | 'UNAUTHORIZED' | 'FETCH_FAILED' | 'UNKNOWN_ERROR' {
    switch (status) {
      case 401:
      case 403:
        return 'UNAUTHORIZED'
      case 404:
      case 500:
        return 'FETCH_FAILED'
      default:
        return 'UNKNOWN_ERROR'
    }
  }
}

// Export singleton instance
export const roomListService = new RoomListService()

// For testing purposes or custom configurations
export { RoomListService }
