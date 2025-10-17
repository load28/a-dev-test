/**
 * Booking API Service
 * Handles all booking-related API calls
 */

import type {
  Booking,
  CreateBookingRequest,
  CreateBookingResponse,
  GetBookingsResponse,
  GetBookingResponse,
} from '../types/booking'
import { BookingError, BookingErrorCode } from '../types/booking'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

/**
 * Booking Service Class
 * Manages API communication for bookings
 */
class BookingService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Create a new booking
   * POST /api/bookings
   */
  async createBooking(
    accessToken: string,
    bookingData: CreateBookingRequest
  ): Promise<Booking> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      const data: CreateBookingResponse = await response.json()
      return data.booking
    } catch (error) {
      if (error instanceof BookingError) {
        throw error
      }
      throw new BookingError('Failed to create booking', BookingErrorCode.NETWORK_ERROR)
    }
  }

  /**
   * Get all bookings for the authenticated user
   * GET /api/bookings
   */
  async getBookings(
    accessToken: string,
    params?: {
      page?: number
      limit?: number
      status?: string
    }
  ): Promise<GetBookingsResponse> {
    try {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.status) queryParams.append('status', params.status)

      const url = `${this.baseUrl}/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      const data: GetBookingsResponse = await response.json()
      return data
    } catch (error) {
      if (error instanceof BookingError) {
        throw error
      }
      throw new BookingError('Failed to fetch bookings', BookingErrorCode.NETWORK_ERROR)
    }
  }

  /**
   * Get a specific booking by ID
   * GET /api/bookings/:id
   */
  async getBookingById(accessToken: string, bookingId: string): Promise<Booking> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${bookingId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      const data: GetBookingResponse = await response.json()
      return data.booking
    } catch (error) {
      if (error instanceof BookingError) {
        throw error
      }
      throw new BookingError('Failed to fetch booking', BookingErrorCode.NETWORK_ERROR)
    }
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<BookingError> {
    let errorMessage = 'An error occurred'
    let errorCode = BookingErrorCode.UNKNOWN_ERROR

    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
      errorCode = this.mapHttpStatusToErrorCode(response.status)
    } catch {
      errorCode = this.mapHttpStatusToErrorCode(response.status)
    }

    return new BookingError(errorMessage, errorCode)
  }

  /**
   * Map HTTP status codes to BookingErrorCode
   */
  private mapHttpStatusToErrorCode(status: number): BookingErrorCode {
    switch (status) {
      case 400:
        return BookingErrorCode.INVALID_REQUEST
      case 401:
        return BookingErrorCode.UNAUTHORIZED
      case 404:
        return BookingErrorCode.BOOKING_NOT_FOUND
      case 409:
        return BookingErrorCode.CONFLICT
      default:
        return BookingErrorCode.UNKNOWN_ERROR
    }
  }
}

// Export singleton instance
export const bookingService = new BookingService()

// For testing purposes or custom configurations
export { BookingService }
