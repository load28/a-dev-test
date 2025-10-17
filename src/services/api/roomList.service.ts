/**
 * Room List Service
 * Handles room booking list API calls with session-based authentication and caching
 */

import type { RoomListResponse, Booking } from '../../types/roomList'
import { RoomListError, RoomListErrorCode } from '../../types/roomList'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  data: RoomListResponse
  timestamp: number
}

/**
 * Room List Service Class
 * Manages API communication for room bookings with caching
 */
class RoomListService {
  private baseUrl: string
  private cache: Map<string, CacheEntry> = new Map()

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Get user's bookings with session-based authentication
   * Uses caching to reduce API calls
   */
  async getBookings(
    accessToken: string,
    options: {
      forceRefresh?: boolean
      userId?: string
    } = {}
  ): Promise<RoomListResponse> {
    const { forceRefresh = false, userId } = options
    const cacheKey = this.getCacheKey(userId)

    // Check cache first
    if (!forceRefresh) {
      const cachedData = this.getFromCache(cacheKey)
      if (cachedData) {
        return cachedData
      }
    }

    try {
      const url = userId
        ? `${this.baseUrl}/bookings?userId=${userId}`
        : `${this.baseUrl}/bookings`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include', // Include session cookies
      })

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      const data: RoomListResponse = await response.json()

      // Cache the result
      this.setCache(cacheKey, data)

      return data
    } catch (error) {
      if (error instanceof RoomListError) {
        throw error
      }
      throw new RoomListError('Failed to fetch bookings', RoomListErrorCode.NETWORK_ERROR)
    }
  }

  /**
   * Get a specific booking by ID
   */
  async getBookingById(accessToken: string, bookingId: string): Promise<Booking> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${bookingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      const data: { booking: Booking } = await response.json()
      return data.booking
    } catch (error) {
      if (error instanceof RoomListError) {
        throw error
      }
      throw new RoomListError(
        'Failed to fetch booking details',
        RoomListErrorCode.NETWORK_ERROR
      )
    }
  }

  /**
   * Clear cache for a specific user or all cache
   */
  clearCache(userId?: string): void {
    if (userId) {
      const cacheKey = this.getCacheKey(userId)
      this.cache.delete(cacheKey)
    } else {
      this.cache.clear()
    }
  }

  /**
   * Get data from cache if valid
   */
  private getFromCache(key: string): RoomListResponse | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    const isExpired = Date.now() - entry.timestamp > CACHE_DURATION

    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Store data in cache
   */
  private setCache(key: string, data: RoomListResponse): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * Generate cache key
   */
  private getCacheKey(userId?: string): string {
    return userId ? `bookings_${userId}` : 'bookings_current_user'
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<RoomListError> {
    let errorMessage = 'An error occurred'
    let errorCode = RoomListErrorCode.UNKNOWN_ERROR

    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
      errorCode = this.mapHttpStatusToErrorCode(response.status)
    } catch {
      errorCode = this.mapHttpStatusToErrorCode(response.status)
    }

    return new RoomListError(errorMessage, errorCode)
  }

  /**
   * Map HTTP status codes to RoomListErrorCode
   */
  private mapHttpStatusToErrorCode(status: number): RoomListErrorCode {
    switch (status) {
      case 401:
      case 403:
        return RoomListErrorCode.UNAUTHORIZED
      case 404:
        return RoomListErrorCode.NOT_FOUND
      default:
        return RoomListErrorCode.UNKNOWN_ERROR
    }
  }
}

// Export singleton instance
export const roomListService = new RoomListService()

// For testing purposes or custom configurations
export { RoomListService }
