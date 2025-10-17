/**
 * Room Booking Service
 * Handles all room booking API operations with proper error handling
 */

import { API_BASE_URL } from '@/config/auth.config'
import {
  BookingError,
  BookingErrorCode,
} from '@/types/roomBooking'
import type {
  BookingRequest,
  BookingResponse,
  CreateBookingApiResponse,
  BookingListResponse,
  BookingQueryParams,
} from '@/types/roomBooking'

/**
 * Room Booking Service Class
 * Manages API calls for room booking operations
 */
class RoomBookingService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Create a new room booking
   * @param bookingData - Booking request data
   * @param accessToken - User's access token for authentication
   * @returns Promise<BookingResponse> - Created booking details
   * @throws BookingError - If booking creation fails
   */
  async createBooking(
    bookingData: BookingRequest,
    accessToken: string
  ): Promise<BookingResponse> {
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

      const result: CreateBookingApiResponse = await response.json()
      return result.data
    } catch (error) {
      if (error instanceof BookingError) {
        throw error
      }
      throw new BookingError(
        'Failed to create booking. Please check your network connection.',
        BookingErrorCode.NETWORK_ERROR
      )
    }
  }

  /**
   * Get list of bookings with optional filters
   * @param params - Query parameters for filtering
   * @param accessToken - User's access token for authentication
   * @returns Promise<BookingResponse[]> - List of bookings
   * @throws BookingError - If fetching bookings fails
   */
  async getBookings(
    params: BookingQueryParams,
    accessToken: string
  ): Promise<BookingResponse[]> {
    try {
      const queryString = this.buildQueryString(params)
      const url = `${this.baseUrl}/bookings${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      const result: BookingListResponse = await response.json()
      return result.data
    } catch (error) {
      if (error instanceof BookingError) {
        throw error
      }
      throw new BookingError(
        'Failed to fetch bookings. Please check your network connection.',
        BookingErrorCode.NETWORK_ERROR
      )
    }
  }

  /**
   * Get a specific booking by ID
   * @param bookingId - The booking ID to fetch
   * @param accessToken - User's access token for authentication
   * @returns Promise<BookingResponse> - Booking details
   * @throws BookingError - If fetching booking fails
   */
  async getBookingById(
    bookingId: string,
    accessToken: string
  ): Promise<BookingResponse> {
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

      const result: CreateBookingApiResponse = await response.json()
      return result.data
    } catch (error) {
      if (error instanceof BookingError) {
        throw error
      }
      throw new BookingError(
        'Failed to fetch booking details. Please check your network connection.',
        BookingErrorCode.NETWORK_ERROR
      )
    }
  }

  /**
   * Update an existing booking
   * @param bookingId - The booking ID to update
   * @param bookingData - Updated booking data
   * @param accessToken - User's access token for authentication
   * @returns Promise<BookingResponse> - Updated booking details
   * @throws BookingError - If update fails
   */
  async updateBooking(
    bookingId: string,
    bookingData: Partial<BookingRequest>,
    accessToken: string
  ): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      const result: CreateBookingApiResponse = await response.json()
      return result.data
    } catch (error) {
      if (error instanceof BookingError) {
        throw error
      }
      throw new BookingError(
        'Failed to update booking. Please check your network connection.',
        BookingErrorCode.NETWORK_ERROR
      )
    }
  }

  /**
   * Cancel a booking
   * @param bookingId - The booking ID to cancel
   * @param accessToken - User's access token for authentication
   * @returns Promise<BookingResponse> - Cancelled booking details
   * @throws BookingError - If cancellation fails
   */
  async cancelBooking(
    bookingId: string,
    accessToken: string
  ): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      const result: CreateBookingApiResponse = await response.json()
      return result.data
    } catch (error) {
      if (error instanceof BookingError) {
        throw error
      }
      throw new BookingError(
        'Failed to cancel booking. Please check your network connection.',
        BookingErrorCode.NETWORK_ERROR
      )
    }
  }

  /**
   * Delete a booking
   * @param bookingId - The booking ID to delete
   * @param accessToken - User's access token for authentication
   * @returns Promise<void>
   * @throws BookingError - If deletion fails
   */
  async deleteBooking(bookingId: string, accessToken: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }
    } catch (error) {
      if (error instanceof BookingError) {
        throw error
      }
      throw new BookingError(
        'Failed to delete booking. Please check your network connection.',
        BookingErrorCode.NETWORK_ERROR
      )
    }
  }

  /**
   * Handle error responses from the API
   * @param response - Fetch Response object
   * @returns Promise<BookingError> - Formatted booking error
   */
  private async handleErrorResponse(response: Response): Promise<BookingError> {
    let errorMessage = 'An error occurred while processing your booking request'
    let errorCode = BookingErrorCode.UNKNOWN_ERROR
    let errorDetails: Record<string, unknown> | undefined

    try {
      const errorData = await response.json()
      errorMessage = errorData.error?.message || errorData.message || errorMessage
      errorDetails = errorData.error?.details || errorData.details

      // Map HTTP status codes to booking error codes
      errorCode = this.mapHttpStatusToErrorCode(response.status, errorData)
    } catch {
      // If JSON parsing fails, use HTTP status code mapping
      errorCode = this.mapHttpStatusToErrorCode(response.status)
    }

    return new BookingError(errorMessage, errorCode, errorDetails)
  }

  /**
   * Map HTTP status codes to BookingErrorCode
   * @param status - HTTP status code
   * @param errorData - Optional error response data
   * @returns BookingErrorCode - Mapped error code
   */
  private mapHttpStatusToErrorCode(
    status: number,
    errorData?: Record<string, unknown>
  ): BookingErrorCode {
    // Check if error data contains a specific error code
    if (errorData?.error && typeof errorData.error === 'object') {
      const error = errorData.error as { code?: string }
      if (error.code && error.code in BookingErrorCode) {
        return error.code as BookingErrorCode
      }
    }

    // Fallback to HTTP status code mapping
    switch (status) {
      case 400:
        return BookingErrorCode.VALIDATION_ERROR
      case 401:
        return BookingErrorCode.UNAUTHORIZED
      case 404:
        return BookingErrorCode.ROOM_NOT_FOUND
      case 409:
        return BookingErrorCode.BOOKING_CONFLICT
      case 422:
        return BookingErrorCode.INVALID_TIME_RANGE
      default:
        return BookingErrorCode.UNKNOWN_ERROR
    }
  }

  /**
   * Build query string from parameters
   * @param params - Query parameters object
   * @returns string - URL query string
   */
  private buildQueryString(params: BookingQueryParams): string {
    const entries = Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )

    if (entries.length === 0) {
      return ''
    }

    return entries.map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`).join('&')
  }
}

// Export singleton instance
export const roomBookingService = new RoomBookingService()

// Export class for testing purposes
export { RoomBookingService }
